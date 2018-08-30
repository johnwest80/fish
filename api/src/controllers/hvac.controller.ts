import { Request, Response, Router, NextFunction } from 'express';
import { LogEntry } from '../models/LogEntrySchema';
import { AuthenticationService } from '../services/AuthenticationService';

const router: Router = Router();

router.get('/devices', AuthenticationService.verifyToken, (req: Request, res: Response, next: NextFunction) => {
    res.send((req as any).user.devices);
});

router.get('/history/:id', AuthenticationService.verifyToken, (req: Request, res: Response) => {
    // tslint:disable-next-line:max-line-length
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
                        date: '$_id.d'
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
        }
    ];

    LogEntry.aggregate(pipeline).then((result: any) => {
        res.send(result);
    }).catch((ex) => res.status(500).send(ex));
});

export const HvacController: Router = router;
