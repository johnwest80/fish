"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MinRuntimeMinutes = 70;
const MinCycles = 7;
const NumDaysLookback = 7;
class TempOutOfRangeAlertPipelineService {
    static getTempOutOfRangeAlertPipeline() {
        return [
            {
                $unwind: { path: '$devices' }
            },
            {
                $lookup: {
                    from: 'startendentries',
                    let: { id: '$devices.id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$id', '$$id'] },
                                        { $gte: ['$end', { $subtract: [new Date(), 1000 * 60 * 60 * 24 * NumDaysLookback] }] },
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                '_id': '$hc',
                                minMinT: { $min: '$minT' },
                                maxMaxT: { $max: '$maxT' },
                                avgMinT: { $avg: '$minT' },
                                avgMaxT: { $avg: '$maxT' },
                                numMinutes: { $sum: '$minutes' },
                                numCycles: { $sum: 1 }
                            }
                        }
                    ],
                    as: 'ends'
                }
            },
            {
                $unwind: '$ends'
            },
            {
                $project: {
                    '_id': 1,
                    name: 1,
                    disabled: 1,
                    devices: {
                        name: 1,
                        id: 1,
                        minHeatRise: 1,
                        maxHeatRise: 1,
                        disabled: 1,
                        baseline: 1
                    },
                    ends: 1
                }
            },
            {
                $match: {
                    $and: [
                        { 'ends.numMinutes': { $gte: MinRuntimeMinutes } },
                        { 'ends.numCycles': { $gte: MinCycles } }
                    ]
                }
            }
        ];
    }
}
exports.TempOutOfRangeAlertPipelineService = TempOutOfRangeAlertPipelineService;
//# sourceMappingURL=temp-out-of-range-alert-pipeline.service.js.map