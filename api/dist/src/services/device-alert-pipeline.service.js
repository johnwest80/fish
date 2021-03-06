"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AlertCode_1 = require("../models/AlertCode");
class DeviceAlertPipelineService {
    static getAllAlertsPipeline(userId) {
        return [
            {
                $match: {
                    'users._id': userId
                }
            },
            {
                $unwind: '$devices'
            },
            {
                $lookup: {
                    from: 'devicealerts',
                    let: { deviceId: '$devices.id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$deviceId', '$$deviceId'] },
                                        { $ne: ['$resolved', true] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'alert'
                }
            },
            {
                $unwind: '$alert'
            },
            {
                $project: {
                    '_id': 0,
                    'location': {
                        _id: '$_id',
                        name: '$name',
                        timezone: '$timezone'
                    },
                    'device': {
                        id: '$devices.id',
                        name: '$devices.name',
                    },
                    alert: {
                        _id: 1,
                        d: 1,
                        alertCode: 1,
                        message: 1,
                        resolved: 1,
                        resolvedDate: 1
                    }
                }
            },
            {
                $sort: {
                    'alert.d': 1
                }
            }
        ];
    }
    static findDevicesNotConnectedWithinXMinutes(minutes) {
        return [
            {
                $match: {
                    $and: [
                        { 'devices.disabled': { $ne: true } }
                    ]
                }
            },
            {
                $unwind: '$devices'
            },
            {
                $lookup: {
                    from: 'logentries',
                    let: { id: '$devices.id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id.n', '$$id'] },
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
                    as: 'lastentry'
                }
            },
            {
                $unwind: '$lastentry'
            },
            {
                $match: {
                    $expr: {
                        $and: [
                            { $lt: ['$lastentry._id.d', { $subtract: [new Date(), 1000 * 60 * minutes] }] }
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: 'devicealerts',
                    let: { deviceId: '$devices.id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$deviceId', '$$deviceId'] },
                                        { $eq: ['$alertCode', AlertCode_1.AlertCode.NotResponsive] },
                                        { $ne: ['$resolved', true] }
                                    ]
                                }
                            }
                        },
                        {
                            $sort: {
                                '_id.d': -1.0
                            }
                        }
                    ],
                    as: 'alert'
                }
            },
            {
                $unwind: { path: '$alert', preserveNullAndEmptyArrays: true }
            },
            { $match: { 'alert': { $eq: null } } },
            {
                $project: {
                    'lastSeen': '$lastentry._id.d',
                    '_id': 0,
                    'location': {
                        _id: '$_id',
                        name: '$name',
                        timezone: '$timezone'
                    },
                    'device': {
                        id: '$devices.id',
                        name: '$devices.name',
                    },
                    lastentry: 1,
                    alert: 1
                }
            }
        ];
    }
    static findAlertsToEmail() {
        return [
            {
                $match: {
                    $and: [
                        { 'devices.disabled': { $ne: true } }
                    ]
                }
            },
            {
                $unwind: '$devices'
            },
            {
                $lookup: {
                    from: 'devicealerts',
                    let: { deviceId: '$devices.id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$deviceId', '$$deviceId'] },
                                        { $ne: ['$emailSent', true] }
                                    ]
                                }
                            }
                        },
                        {
                            $sort: {
                                '_id.d': -1.0
                            }
                        }
                    ],
                    as: 'alert'
                }
            },
            { $unwind: '$alert' },
            {
                $lookup: {
                    from: 'alertmeta',
                    let: { alertCode: '$alert.alertCode' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$alertCode', '$$alertCode'] },
                                        {
                                            $or: [
                                                { $eq: ['$emailOnFailure', true] },
                                                { $eq: ['$emailOnResolve', true] }
                                            ]
                                        }
                                    ],
                                }
                            }
                        },
                    ],
                    as: 'alertMeta'
                }
            },
            { $unwind: { path: '$alertMeta' } },
            { $unwind: '$users' },
            {
                $lookup: {
                    from: 'users',
                    let: { userid: '$users._id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$userid'] },
                                    ]
                                }
                            }
                        },
                    ],
                    as: 'userinfo'
                }
            },
            { $unwind: { path: '$userinfo' } },
            {
                $project: {
                    'location': {
                        _id: '$_id',
                        name: '$name',
                        timezone: '$timezone'
                    },
                    'device': {
                        id: '$devices.id',
                        name: '$devices.name',
                    },
                    userinfo: { email: 1, name: 1 },
                    d: "$lastEntry._id.d",
                    alert: 1,
                    alertMeta: 1
                }
            }
        ];
    }
}
exports.DeviceAlertPipelineService = DeviceAlertPipelineService;
//# sourceMappingURL=device-alert-pipeline.service.js.map