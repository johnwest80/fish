import { ObjectId } from "bson";

export class DeviceUnresolvedAlertSummaryPipelineService {
    public static getAlertSummary(userId: ObjectId) {
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
                                    $and:
                                        [
                                            { $eq: ['$deviceId', '$$deviceId'] },
                                            { $ne: ['$resolved', true] }
                                        ]
                                }
                            }
                        }
                    ],
                    as: 'devicealerts'
                }
            },
            {
                $unwind: '$devicealerts'
            },
            {
                "$group": {
                    "_id": {
                        "devicealerts᎐alertCode": "$devicealerts.alertCode"
                    },
                    "COUNT(*)": {
                        "$sum": 1
                    }
                }
            },
            {
                "$project": {
                    "devicealerts.alertCode": "$_id.devicealerts᎐alertCode",
                    "COUNT(*)": "$COUNT(*)",
                    "_id": 0
                }
            }
        ];
    }
}
