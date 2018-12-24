import { Schema, model } from 'mongoose';
import { IAlertMeta } from './IAlertMeta';

const AlertMetaSchema = new Schema({
    _id: Schema.Types.ObjectId,
    alertCode: { type: String, required: true },
    severity: { type: String, required: true },
    autoResolve: { type: Boolean },
    emailOnFailure: { type: Boolean },
});

export const DeviceAlert = model<IAlertMeta>('AlertMeta', AlertMetaSchema);
