"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LogEntrySchema_1 = require("../models/LogEntrySchema");
const LocationSchema_1 = require("../models/LocationSchema");
const CalendarMinuteSchema_1 = require("../models/CalendarMinuteSchema");
const AuthenticationService_1 = require("../services/AuthenticationService");
const hvac_service_1 = require("../services/hvac.service");
const bson_1 = require("bson");
const router = express_1.Router();
router.get('/locations', AuthenticationService_1.AuthenticationService.verifyToken, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const result = yield LocationSchema_1.Location.find({
            "users._id": req.user._id,
            "disabled": false
        }, {
            "name": 1,
            "devices": 1,
            "disabled": 1,
            "zipCode": 1
        });
        res.send(result);
    }
    catch (ex) {
        res.status(500).send(ex);
    }
}));
router.get('/locationEdit/:id', AuthenticationService_1.AuthenticationService.verifyToken, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const hvacService = new hvac_service_1.HvacService();
    try {
        const result = yield hvacService.getLocationForEdit(req.user._id, req.params.id);
        res.send(result);
    }
    catch (ex) {
        res.status(500).send(ex);
    }
}));
router.put('/locationEdit/:id', AuthenticationService_1.AuthenticationService.verifyToken, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const hvacService = new hvac_service_1.HvacService();
    let location;
    try {
        if (req.params.id === 'null') {
            location = new LocationSchema_1.Location();
            location._id = new bson_1.ObjectId();
            location.timezone = 'America/New_York';
            location.users = [
                { _id: req.user._id }
            ];
        }
        else {
            location = (yield hvacService.getLocationForEdit(req.user._id, req.params.id));
        }
        if (location == null) {
            return res.status(404).send();
        }
        location.name = req.body.name;
        location.zipCode = req.body.zipCode;
        location.disabled = req.body.disabled;
        yield location.save();
        res.send();
    }
    catch (ex) {
        res.status(500).send(ex);
    }
}));
router.get('/deviceEdit/:id', AuthenticationService_1.AuthenticationService.verifyToken, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const hvacService = new hvac_service_1.HvacService();
    try {
        const result = yield hvacService.getDeviceForEdit(req.user._id, req.params.id);
        res.send(result);
    }
    catch (ex) {
        res.status(500).send(ex);
    }
}));
router.put('/deviceEdit/:deviceId', AuthenticationService_1.AuthenticationService.verifyToken, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const hvacService = new hvac_service_1.HvacService();
    try {
        const locationInDb = yield hvacService.getLocationForEditByDeviceId(req.user._id, req.params.deviceId);
        if (locationInDb === null) {
            return res.status(404).send();
        }
        const deviceInDb = locationInDb.devices.find((dev) => dev.id === req.params.deviceId);
        if (deviceInDb === undefined) {
            return res.status(404).send();
        }
        const postedDevice = req.body;
        if (postedDevice === undefined) {
            return res.status(404).send();
        }
        hvacService.setDevicePropertiesFromPost(postedDevice, deviceInDb);
        yield locationInDb.save();
        return res.send();
    }
    catch (ex) {
        res.status(500).send(ex);
    }
}));
router.post('/deviceEdit/:locationId', AuthenticationService_1.AuthenticationService.verifyToken, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const hvacService = new hvac_service_1.HvacService();
    try {
        const locationInDb = yield hvacService.getLocationForEdit(req.user._id, req.params.locationId);
        if (locationInDb === null) {
            return res.status(404).send();
        }
        const postedDevice = req.body;
        const deviceInDb = {
            id: new bson_1.ObjectID().toHexString()
        };
        hvacService.setDevicePropertiesFromPost(postedDevice, deviceInDb);
        if (locationInDb.devices.find((dev) => dev.name.toUpperCase() === postedDevice.name.toUpperCase())) {
            throw new Error('Must have unique name');
        }
        const particleId = yield hvacService.getParticleIdAwaitingAdd(req.user.id, postedDevice.id);
        if (!particleId) {
            throw new Error('Cannot find the device to add.  Please be sure the device is connected to a network.');
        }
        else {
            deviceInDb.particleId = particleId;
        }
        locationInDb.devices.push(deviceInDb);
        yield locationInDb.save();
        return res.send();
    }
    catch (ex) {
        return next(ex);
    }
}));
router.get('/lastEntry/:id', AuthenticationService_1.AuthenticationService.verifyToken, (req, res) => {
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
    LogEntrySchema_1.LogEntry.aggregate(pipeline).then((result) => {
        res.send(result && result.length > 0 ? result[0] : null);
    }).catch((ex) => res.status(500).send(ex));
});
router.get('/history/:id', AuthenticationService_1.AuthenticationService.verifyToken, (req, res) => {
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
                },
                numRuns: { "$sum": { "$cond": [{ "$eq": ["$start", true] }, 1, 0] } }
            }
        },
        {
            $sort: {
                _id: 1
            }
        }
    ];
    LogEntrySchema_1.LogEntry.aggregate(pipeline).then((result) => {
        res.send(result);
    }).catch((ex) => res.status(500).send(ex));
});
router.get('/details/:id/:dateStart/:dateEnd', AuthenticationService_1.AuthenticationService.verifyToken, (req, res) => {
    const pipeline = [
        {
            $match: {
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
                                $and: [
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
    CalendarMinuteSchema_1.CalendarMinute.aggregate(pipeline).then((result) => {
        res.send(result);
    }).catch((ex) => res.status(500).send(ex));
});
exports.HvacController = router;
//# sourceMappingURL=hvac.controller.js.map