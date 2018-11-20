import * as mongoose from 'mongoose';
import { ObjectId, ObjectID } from 'bson';
import { IDevice } from './IDevice';
import { IUser } from './iuser';

export interface IUnassignedDevice extends mongoose.Document {
    _id: ObjectId;
    particleId: string;
    lastSeen: Date;
}
