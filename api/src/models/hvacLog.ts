import mongoose from 'mongoose';
import { IHvacLog } from './iHvacLog';

const HvacLogSchema = new mongoose.Schema({
    temperature: { type: Number, required: true },
    deviceId: { type: String, required: true, unique: false },
    accountId: { type: String, required: true },
    groupTick: { type: Number, required: true },
    dy: { type: Number, required: true },
    mnth: { type: Number, required: true },
    yr: { type: Number, required: true },
    dt: { type: String, required: true },
});

export const HvacLog = mongoose.model<IHvacLog>('HvacLog', HvacLogSchema);
