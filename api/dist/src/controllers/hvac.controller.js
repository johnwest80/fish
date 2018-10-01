"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LogEntrySchema_1 = require("../models/LogEntrySchema");
const CalendarMinuteSchema_1 = require("../models/CalendarMinuteSchema");
const AuthenticationService_1 = require("../services/AuthenticationService");
const router = express_1.Router();
router.get('/devices', AuthenticationService_1.AuthenticationService.verifyToken, (req, res, next) => {
    res.send(req.user.devices);
});
router.get('/lastEntry/:id', AuthenticationService_1.AuthenticationService.verifyToken, (req, res) => {
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
    LogEntrySchema_1.LogEntry.aggregate(pipeline).then((result) => {
        res.send(result);
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
                }
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
                'l.t': 1
            }
        }
    ];
    CalendarMinuteSchema_1.CalendarMinute.aggregate(pipeline).then((result) => {
        res.send(result);
    }).catch((ex) => res.status(500).send(ex));
});
exports.HvacController = router;
//# sourceMappingURL=hvac.controller.js.map