import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';
import { IDevice } from './IDevice';
import { IUser } from './iuser';

export interface ILocation extends mongoose.Document {
    _id: ObjectId;
    name: string;
    timezone: string;
    devices: [IDevice];
    zipCode: string;
    users: [IUser];
    disabled: boolean;
}
