import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';

export interface IDeviceImage extends mongoose.Document {
    _id: ObjectId;
    name: string;
    primary: boolean;
}
