import { Request, Response, Router, NextFunction } from 'express';
import { LogEntry } from '../models/LogEntrySchema';
import { Location } from '../models/LocationSchema';
import { CalendarMinute } from '../models/CalendarMinuteSchema';
import { AuthenticationService, IAuthenticatedRequest } from '../services/AuthenticationService';
import { HvacService } from '../services/hvac.service';
import { ILocation } from '../models/ILocation';
import { IDevice } from '../models/IDevice';

const router: Router = Router();

router.get('/locations', AuthenticationService.verifyToken, async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const result = await Location.find({
            "users._id": req.user._id
        }, {
                "name": 1,
                "devices": 1
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

router.post('/locationEdit/:id', AuthenticationService.verifyToken,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        const hvacService = new HvacService();

        try {
            const location = await hvacService.getLocationForEdit(req.user._id, req.params.id) as ILocation;
            if (location == null) {
                return res.status(404).send();
            }
            location.name = req.body.name;
            location.zipCode = req.body.zipCode;
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

router.post('/deviceEdit/:id', AuthenticationService.verifyToken,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        const hvacService = new HvacService();

        try {
            const locationInDb = await hvacService.getLocationForEditByDeviceId(req.user._id, req.params.id) as ILocation;
            if (locationInDb === null) {
                return res.status(404).send();
            }
            const deviceInDb = locationInDb.devices.find((dev) => dev.id === req.params.id);
            if (deviceInDb === undefined) {
                return res.status(404).send();
            }

            const postedDevice = req.body as IDevice;
            if (postedDevice === undefined) {
                return res.status(404).send();
            }

            deviceInDb.name = postedDevice.name;
            deviceInDb.minHeatRise = postedDevice.minHeatRise;
            deviceInDb.maxHeatRise = postedDevice.maxHeatRise;

            await locationInDb.save();

            return res.send();
        } catch (ex) {
            res.status(500).send(ex);
        }
    });

router.get('/lastEntry/:id', AuthenticationService.verifyToken, (req: Request, res: Response) => {
    const pipeline = [
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
        res.send(result);
    }).catch((ex) => res.status(500).send(ex));
});

router.get('/history/:id', AuthenticationService.verifyToken, (req: Request, res: Response) => {
    const pipeline = [
        {
            $match: {
                $and: [
                    {
                        '_id.n': req.params.id
                    }
                ]
            }
        },
        {
            $addFields: {
                yearMonthDay: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$_id.d',
                        timezone: 'America/New_York'
                    }
                }
            }
        },
        {
            $group: {
                _id: '$yearMonthDay',
                min: {
                    $min: '$t'
                },
                max: {
                    $max: '$t'
                }
            }
        },
        {
            $sort: {
                _id: 1
            }
        }
    ];

    LogEntry.aggregate(pipeline).then((result: any) => {
        res.send(result);
    }).catch((ex) => res.status(500).send(ex));
});

router.get('/details/:id/:dateStart/:dateEnd', AuthenticationService.verifyToken, (req: Request, res: Response) => {
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
                                    { $eq: ['$z', '30004'] }
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
                'l.w': 1
            }
        }
    ];

    CalendarMinute.aggregate(pipeline).then((result: any) => {
        res.send(result);
    }).catch((ex) => res.status(500).send(ex));
});

export const HvacController: Router = router;
