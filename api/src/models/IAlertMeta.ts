import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';

export interface IAlertMeta extends mongoose.Document {
    _id: ObjectId;
    alertCode: string;
    severity: string;
    autoResolve: boolean;
    emailOnFailure: boolean;
    emailOnResolve: boolean;
}
