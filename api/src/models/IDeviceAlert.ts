import * as mongoose from 'mongoose';
import { ObjectId, ObjectID } from 'bson';
import { IDevice } from './IDevice';
import { IUser } from './iuser';

export interface IDeviceAlert extends mongoose.Document {
    _id: ObjectId;
    deviceId: string;
    d: Date;
    alertCode: string;
    message: string;
    resolved: boolean;
    resolvedDate: Date;
    emailSent: boolean;
    emailSentDate: Date;
}
