import { ObjectID } from "mongodb";

export interface IGetAlertsResult {
    alert: {
        d: Date,
        alertCode: string,
        message: string
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
