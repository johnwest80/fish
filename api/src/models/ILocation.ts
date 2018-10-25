import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';
import { IDevice } from './IDevice';

export interface ILocation extends mongoose.Document {
    _id: ObjectId;
    name: string;
    timezone: string;
    devices: [IDevice];
}
