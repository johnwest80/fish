import { ObjectID, ObjectId } from "mongodb";

export interface IGetAlertsResult {
    alert: {
        _id: ObjectId,
        d: Date,
        alertCode: AlertCode,
        message: string,
        resolved: boolean,
        resolvedDate: Date
    };
    location: {
        _id: ObjectID,
        name: string,
        timezone: string
    };
    device: {
        id: string;
        name: string;
    };
}

export interface IGetAlertSummaryResult {
    deviceAlert: {
        alertCode: AlertCode
    };
    total: number;
}
