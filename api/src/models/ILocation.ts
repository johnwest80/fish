import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';

export interface ILocation extends mongoose.Document {
    _id: ObjectId;
    name: string;
    timezone: string;
}
