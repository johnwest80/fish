import { Schema, model } from 'mongoose';
import { ILocation } from './ILocation';
import { ObjectID } from 'bson';

const UserDeviceSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: { type: String, required: true, unique: false },
    id: { type: String, required: true, unique: false }
});

const LocationSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: { type: String, required: true },
    timezone: { type: String, required: true },
    devices: { type: [UserDeviceSchema], required: false },
    users:  [{ type: Schema.Types.ObjectId, ref: 'users' }]
});

export const Location = model<ILocation>('locations', LocationSchema);
