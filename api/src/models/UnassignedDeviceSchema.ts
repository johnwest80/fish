import { Schema, model } from 'mongoose';
import { ILocation } from './ILocation';
import { ObjectID } from 'bson';
import { IDevice } from './IDevice';
import { IUnassignedDevice } from './IUnassignedDevice';

const UnassignedDeviceSchema = new Schema({
    _id: Schema.Types.ObjectId,
    particleId: { type: String, required: true },
    lastSeen: { type: Date, required: true }
});

export const UnassignedDevice = model<IUnassignedDevice>('UnassignedDevice', UnassignedDeviceSchema);
