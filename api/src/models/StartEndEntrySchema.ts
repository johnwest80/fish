import { Schema, model } from 'mongoose';
import { ILogEntry } from './ILogEntry';

const StartEndEntrySchema = new Schema({
    id: { type: Schema.Types.ObjectId, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    ymd: { type: String, required: true },
    minutes: { type: Number, required: true },
    minI: { type: Number, required: true },
    maxI: { type: Number, required: true },
    minO: { type: Number, required: true },
    maxO: { type: Number, required: true },
    minT: { type: Number, required: true },
    maxT: { type: Number, required: true },
    minW: { type: Number, required: true },
    maxW: { type: Number, required: true },
    hc: { type: String, required: true },
    temperature: { type: Number },
    humidity: { type: Number },
    records: { type: Number, required: true },
    missingRecords: { type: Boolean, required: true }
});

export const StartEndEntry = model<ILogEntry>('StartEndEntry', StartEndEntrySchema);
