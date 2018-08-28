import { Request, Response, Router, NextFunction } from 'express';
import { AuthenticationService } from '../services/AuthenticationService';
import { HvacLog } from '../models/hvacLog';
import { IHvacLog } from '../models/iHvacLog';
import * as mongoose from 'mongoose';

const router: Router = Router();

router.post('/log', (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    const log = new HvacLog({
        temperature: req.body.temperature,
        deviceId: req.body.deviceId, accountId: req.body.accountId, groupTick: req.body.groupTick,
        yr: req.body.yr, mnth: req.body.mnth, dy: req.body.dy, dt: req.body.dt
    } as IHvacLog);
    log.save((err) => {
        res.send(err);
    });
});

router.get('/history', (req: Request, res: Response) => {
    // tslint:disable-next-line:max-line-length
    const pipeline = [
        { $sort: { temperature: 1 } },
        { $match: { $and: [{ deviceId: { $not: /28-0118325063ff/ } }, { temperature: { $gt: 32 } }] } },
        {
            $group: {
                _id: { tick: '$groupTick', yr: '$yr', mnth: '$mnth', dy: '$dy' },
                low: { $min: '$temperature' }, high: { $max: '$temperature' }
            }
        },
        {
            $project: {
                _id: '$_id',
                yr: '$_id.yr',
                mnth: '$_id.mnth',
                dy: '$_id.dy',
                high: '$high', low: '$low',
                diff: { $subtract: ['$high', '$low'] }
            }
        },
        {
            $group: {
                _id: { yr: '$yr', mnth: '$mnth', dy: '$dy' },
                diff: { $max: '$diff' }
            }
        },
        { $sort: { _id: -1 } }
    ];

    HvacLog.aggregate(pipeline).then((result: any) => {
        res.send(result);
    }).catch((ex) => res.status(500).send(ex));
});

export const HvacController: Router = router;
