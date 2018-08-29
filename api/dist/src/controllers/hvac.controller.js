"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hvacLog_1 = require("../models/hvacLog");
const router = express_1.Router();
router.post('/log', (req, res, next) => {
    console.log(req.body);
    const log = new hvacLog_1.HvacLog({
        temperature: req.body.temperature,
        deviceId: req.body.deviceId, accountId: req.body.accountId, groupTick: req.body.groupTick,
        yr: req.body.yr, mnth: req.body.mnth, dy: req.body.dy, dt: req.body.dt
    });
    log.save((err) => {
        res.send(err);
    });
});
router.get('/history', (req, res) => {
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
    hvacLog_1.HvacLog.aggregate(pipeline).then((result) => {
        res.send(result);
    }).catch((ex) => res.status(500).send(ex));
});
exports.HvacController = router;
//# sourceMappingURL=hvac.controller.js.map