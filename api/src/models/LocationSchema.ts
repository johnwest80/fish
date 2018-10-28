import { Schema, model } from 'mongoose';
import { ILocation } from './ILocation';
import { ObjectID } from 'bson';

const UserDeviceSchema = new Schema({
    name: { type: String, required: true, unique: false },
    minHeatRise: { type: Number },
    maxHeatRise: { type: Number },
    id: { type: String, required: true, unique: false }
});

const LocationSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: { type: String, required: true },
    timezone: { type: String, required: true },
    zipCode: { type: String, required: true, unique: false },
    devices: { type: [UserDeviceSchema], required: false },
    users:  [{ _id: { type: Schema.Types.ObjectId, ref: 'User' } }]
});

export const Location = model<ILocation>('Location', LocationSchema);
