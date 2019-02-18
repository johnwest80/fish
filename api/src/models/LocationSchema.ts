import { Schema, model } from 'mongoose';
import { ILocation } from './ILocation';
import { ObjectID } from 'bson';
import { IDevice } from './IDevice';

export const DeviceImageSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true, unique: false },
    primary: { type: Boolean, required: true, default: false },
});

export const UserDeviceSchema = new Schema({
    name: { type: String, required: true, unique: false },
    minHeatRise: { type: Number },
    maxHeatRise: { type: Number },
    id: { type: String, required: true, unique: false },
    particleId: { type: String, required: false, unique: false },
    disabled: { type: Boolean, required: true, default: false },
    reversed: { type: Boolean, required: true, default: false },
    filterSize: { type: String },
    images: { type: [DeviceImageSchema], required: false },
    baseline: {
        heat: { type: Number },
        cool: { type: Number },
        tolerancePercent: { type: Number },
    },
    detectLeaksOnClosedPin: { type: Boolean, required: true, default: false },
    opinAlert: { type: Boolean, default: false },
    cpinAlert: { type: Boolean, default: false },
});

const LocationSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: { type: String, required: true },
    timezone: { type: String, required: true },
    zipCode: { type: String, required: true, unique: false },
    devices: { type: [UserDeviceSchema], required: false },
    users: [{ _id: { type: Schema.Types.ObjectId, ref: 'User' } }],
    disabled: { type: Boolean, required: true, default: false }
});

export const Location = model<ILocation>('Location', LocationSchema);
