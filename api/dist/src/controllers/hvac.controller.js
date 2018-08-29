"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LogEntrySchema_1 = require("../models/LogEntrySchema");
const router = express_1.Router();
router.get('/history', (req, res) => {
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
    LogEntrySchema_1.LogEntry.aggregate(pipeline).then((result) => {
        res.send(result);
    }).catch((ex) => res.status(500).send(ex));
});
exports.HvacController = router;
//# sourceMappingURL=hvac.controller.js.map