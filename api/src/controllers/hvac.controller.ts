import { Request, Response, Router, NextFunction } from 'express';
import { LogEntry } from '../models/LogEntrySchema';
import { CalendarMinute } from '../models/CalendarMinuteSchema';
import { AuthenticationService } from '../services/AuthenticationService';

const router: Router = Router();

router.get('/devices', AuthenticationService.verifyToken, (req: Request, res: Response, next: NextFunction) => {
    res.send((req as any).user.devices);
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
const pipeline =     [
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
            'l.t': 1
        }
    }
];

CalendarMinute.aggregate(pipeline).then((result: any) => {
        res.send(result);
    }).catch((ex) => res.status(500).send(ex));
});

export const HvacController: Router = router;
