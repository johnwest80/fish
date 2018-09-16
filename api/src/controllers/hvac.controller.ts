import { Request, Response, Router, NextFunction } from 'express';
import { LogEntry } from '../models/LogEntrySchema';
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

    const pipeline = [
        {
            $match: {
                $and: [
                    {
                        '_id.d': {
                            $gt: new Date(req.params.dateStart)
                        }
                    },
                    {
                        '_id.d': {
                            $lt: new Date(req.params.dateEnd)
                        }
                    },
                    {
                        '_id.n': req.params.id
                    }
                ]
            }
        },
        {
            $sort: {
                '_id.d': 1.0
            }
        }
    ];

    LogEntry.aggregate(pipeline).then((result: any) => {
        res.send(result);
    }).catch((ex) => res.status(500).send(ex));
});

export const HvacController: Router = router;
