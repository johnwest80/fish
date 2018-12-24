import { Schema, model } from 'mongoose';
import { IDeviceAlert } from './IDeviceAlert';

const DeviceAlertSchema = new Schema({
    _id: Schema.Types.ObjectId,
    deviceId: { type: String, required: true },
    d: { type: Date, required: true },
    alertCode: { type: String, required: true },
    message: { type: String, required: true },
    resolved: { type: Boolean },
    resolvedDate: { type: Date },
    emailSent: { type: Boolean },
    emailSentDate: { type: Date }
});

export const DeviceAlert = model<IDeviceAlert>('DeviceAlert', DeviceAlertSchema);
