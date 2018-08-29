import { Request, Response, Router } from 'express';
import { LogEntry } from '../models/LogEntrySchema';

const router: Router = Router();

router.get('/history', (req: Request, res: Response) => {
    // tslint:disable-next-line:max-line-length
    const pipeline = [
        {
            $match: {
                $and: [
                    {
                        '_id.n': '270044000347363339343638'
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
