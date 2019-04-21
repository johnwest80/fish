import { Request, Response, Router, NextFunction } from 'express';
import { LogEntry } from '../models/LogEntrySchema';
import { Location, UserDeviceSchema } from '../models/LocationSchema';
import { CalendarMinute } from '../models/CalendarMinuteSchema';
import { AuthenticationService, IAuthenticatedRequest } from '../services/AuthenticationService';
import { HvacService } from '../services/hvac.service';
import { ILocation } from '../models/ILocation';
import { IDevice } from '../models/IDevice';
import { ObjectId, ObjectID } from 'bson';
import { StartEndEntry } from '../models/StartEndEntrySchema';
import { PermissionService } from '../services/permission.service';
import * as moment from 'moment';
import * as extendMoment from 'moment-range';

const momentWithRange = extendMoment.extendMoment(moment);

const router: Router = Router();

export interface ILastEntriesResult {
    deviceId: string;
    lastSeen: Date;
}

router.get('/locations', AuthenticationService.verifyToken, async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const result = await Location.find({
            "users._id": req.user._id,
            "disabled": false
        }, {
                "name": 1,
                "devices": 1,
                "disabled": 1,
                "zipCode": 1,
                "timezone": 1
            });

        res.send(result);
    } catch (ex) {
        res.status(500).send(ex);
    }
});

router.get('/locationEdit/:id', AuthenticationService.verifyToken,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        const hvacService = new HvacService();
        try {
            const result = await hvacService.getLocationForEdit(req.user._id, req.params.id);

            res.send(result);
        } catch (ex) {
            res.status(500).send(ex);
        }
    });

router.put('/locationEdit/:id', AuthenticationService.verifyToken,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        const hvacService = new HvacService();
        let location: ILocation;
        try {
            if (req.params.id === 'null') {
                location = new Location();
                location._id = new ObjectId();
                location.timezone = 'America/New_York';
                location.users = [
                    { _id: req.user._id }
                ];
            } else {
                location = await hvacService.getLocationForEdit(req.user._id, req.params.id) as ILocation;
            }
            if (location == null) {
                return res.status(404).send();
            }
            location.name = req.body.name;
            location.zipCode = req.body.zipCode;
            location.disabled = req.body.disabled;
            await location.save();
            res.send();
        } catch (ex) {
            res.status(500).send(ex);
        }
    });

router.get('/deviceEdit/:id', AuthenticationService.verifyToken,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        const hvacService = new HvacService();
        try {
            const result = await hvacService.getDeviceForEdit(req.user._id, req.params.id);

            res.send(result);
        } catch (ex) {
            res.status(500).send(ex);
        }
    });

router.put('/deviceEdit/:deviceId', AuthenticationService.verifyToken,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        const hvacService = new HvacService();

        try {
            const locationInDb = await hvacService.getLocationForEditByDeviceId(req.user._id, req.params.deviceId) as ILocation;
            if (locationInDb === null) {
                return res.status(404).send();
            }

            const deviceInDb = locationInDb.devices.find((dev) => dev.id === req.params.deviceId);
            if (deviceInDb === undefined) {
                return res.status(404).send();
            }

            const postedDevice = req.body as IDevice;
            if (postedDevice === undefined) {
                return res.status(404).send();
            }

            hvacService.setDevicePropertiesFromPost(postedDevice, deviceInDb);

            await locationInDb.save();

            return res.send();
        } catch (ex) {
            res.status(500).send(ex);
        }
    });

router.post('/deviceEdit/:locationId', AuthenticationService.verifyToken,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        const hvacService = new HvacService();

        try {
            const locationInDb = await hvacService.getLocationForEdit(req.user._id, req.params.locationId) as ILocation;
            if (locationInDb === null) {
                return res.status(404).send();
            }

            const postedDevice = req.body as IDevice;
            const deviceInDb = {
                id: new ObjectID().toHexString()
            } as IDevice;

            hvacService.setDevicePropertiesFromPost(postedDevice, deviceInDb);

            if (locationInDb.devices.find((dev) => dev.name.toUpperCase() === postedDevice.name.toUpperCase())) {
                throw new Error('Must have unique name');
            }

            const particleId = await hvacService.getParticleIdAwaitingAdd(req.user.id, postedDevice.id);

            if (!particleId) {
                throw new Error('Cannot find the device to add.  Please be sure the device is connected to a network.');
            } else {
                deviceInDb.particleId = particleId;
            }

            locationInDb.devices.push(deviceInDb);
            await locationInDb.save();

            return res.send();
        } catch (ex) {
            return next(ex);
        }
    });

router.put('/deviceReplace/:deviceId', AuthenticationService.verifyToken,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        const hvacService = new HvacService();

        try {
            const locationInDb = await hvacService.getLocationForEditByDeviceId(req.user._id, req.params.deviceId) as ILocation;
            if (locationInDb === null) {
                return res.status(404).send();
            }

            const deviceInDb = locationInDb.devices.find((dev) => dev.id === req.params.deviceId);
            if (deviceInDb === undefined) {
                return res.status(404).send();
            }

            const postedDevice = req.body as IDevice;
            if (postedDevice === undefined) {
                return res.status(404).send();
            }

            const particleId = await hvacService.getParticleIdAwaitingAdd(req.user.id, postedDevice.particleId);

            if (!particleId) {
                throw new Error('Cannot find the device to add.  Please be sure the device is connected to a network.');
            } else {
                deviceInDb.particleId = particleId;
            }

            await locationInDb.save();

            return res.send();
        } catch (ex) {
            return next(ex);
        }
    });

router.get('/lastEntries', AuthenticationService.verifyToken, (req: IAuthenticatedRequest, res: Response) => {
    const pipeline = [
        {
            $match: {
                'users._id': req.user._id
            }
        },
        {
            $unwind: '$devices'
        },
        {
            $lookup: {
                from: 'logentries',
                let: { deviceId: '$devices.id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and:
                                    [
                                        { $eq: ['$_id.n', '$$deviceId'] },
                                    ]
                            }
                        }
                    },
                    {
                        $sort: {
                            '_id.d': -1.0
                        }
                    },
                    {
                        $limit: 1
                    }
                ],
                as: 'l'
            }
        },
        {
            $unwind: "$l"
        },
        {
            $project: {
                "_id": 0,
                "deviceId": "$devices.id",
                "lastSeen": "$l._id.d",
                "i": "$l.i",
                "o": "$l.o",
                "t": "$l.t",
                "w": "$l.w",
                "opinAlert": "$devices.opinAlert",
                "cpinAlert": "$devices.cpinAlert"
            }
        }
    ];

    Location.aggregate(pipeline).then((result: ILastEntriesResult[]) => {
        res.send(result);
    }).catch((ex) => res.status(500).send(ex));
});

router.get('/lastEntry/:id', AuthenticationService.verifyToken, (req: Request, res: Response) => {
    const pipeline = [
        {
            $match: {
                "_id.n": req.params.id
            }
        },
        {
            $sort: {
                '_id.d': -1.0
            }
        },
        {
            $limit: 1.0
        }
    ];

    LogEntry.aggregate(pipeline).then((result: any) => {
        res.send(result && result.length > 0 ? result[0] : null);
    }).catch((ex) => res.status(500).send(ex));
});

router.get('/history/:id', AuthenticationService.verifyToken, async (req: IAuthenticatedRequest, res: Response) => {
    const deviceId = req.params.id;
    if (!PermissionService.canUserAccessDevice(req.user._id, deviceId)) {
        res.status(403).send('Not authorized');
        return;
    }
    const pipeline = [
        {
            $match: {
                $and: [
                    {
                        'id': deviceId
                    }
                ]
            }
        },
        {
            $group: {
                _id: '$ymd',
                minCool: {
                    $min: { "$cond": [{ "$eq": ["$hc", 'cool'] }, '$maxT', null] }
                },
                maxCool: {
                    $max: { "$cond": [{ "$eq": ["$hc", 'cool'] }, '$maxT', null] }
                },
                minHeat: {
                    $min: { $abs: { "$cond": [{ "$eq": ["$hc", 'heat'] }, '$minT', null] } }
                },
                maxHeat: {
                    $max: { $abs: { "$cond": [{ "$eq": ["$hc", 'heat'] }, '$minT', null] } }
                },
                minTemp: {
                    $min: '$temperature'
                },
                maxTemp: {
                    $max: '$temperature'
                },
                numRuns: { "$sum": 1 }
            }
        },
        {
            $addFields: {
                'min': { "$cond": [{ "$gt": ["$minCool", '$minHeat'] }, '$minCool', '$minHeat'] },
                'max': { "$cond": [{ "$gt": ["$maxCool", '$maxHeat'] }, '$maxCool', '$maxHeat'] },
                'maxHc': {
                    "$cond": [{ "$gt": ["$numRuns", 0] },
                    { "$cond": [{ "$gt": ["$maxCool", '$maxHeat'] }, 'cool', 'heat'] },
                        'none']
                }
            }
        },
        {
            $sort: {
                "_id": 1
            }
        }
    ];

    try {
        const result: any[] = await StartEndEntry.aggregate(pipeline);
        const rangedResults: any[] = [];
        if (result.length > 0) {
            const firstDate = result[0]._id;
            const range = momentWithRange.range(firstDate, new Date());

            for (const day of range.by('day')) {
                const existingResult = result.find(x => x._id === day.format('YYYY-MM-DD'));
                rangedResults.push(existingResult || { _id: day.format('YYYY-MM-DD') });
            }
        }
        res.send(rangedResults);
    } catch (ex) {
        res.status(500).send(ex);
    }
});

router.get('/details/:id/:dateStart/:dateEnd', AuthenticationService.verifyToken, async (req: IAuthenticatedRequest, res: Response) => {
    const hvacService = new HvacService();
    const location = await hvacService.getLocationForEditByDeviceId(req.user._id, req.params.id);
    const pipeline = [
        {
            $match:
            {
                $and: [{
                    _id: {
                        $gte: new Date(req.params.dateStart)
                    }
                },
                {
                    _id: {
                        $lt: new Date(req.params.dateEnd)
                    }
                }]

            }
        },
        {
            $lookup: {
                from: 'weatherentries',
                let: { calendarDate: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$d', '$$calendarDate'] },
                                    { $eq: ['$z', location.zipCode] }
                                ]
                            }

                        }
                    },
                    {
                        $limit: 1
                    }
                ],
                as: 'w'
            }
        },
        {
            $lookup: {
                from: 'logentries',
                let: { calendarDate: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and:
                                    [
                                        { $eq: ['$_id.d', '$$calendarDate'] },
                                        { $eq: ['$_id.n', req.params.id] },
                                    ]
                            }
                        }
                    },
                    {
                        $limit: 1
                    }
                ],
                as: 'l'
            }
        },
        {
            $project: {
                '_id': 1,
                'w.w.main.temp': 1,
                'w.w.main.humidity': 1,
                'l.i': 1,
                'l.o': 1,
                'l.t': 1,
                'l.w': 1,
                'l.start': 1,
                'l.end': 1
            }
        }
    ];

    CalendarMinute.aggregate(pipeline).then((result: any) => {
        res.send(result);
    }).catch((ex) => res.status(500).send(ex));
});

export const HvacController: Router = router;
