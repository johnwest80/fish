import { Schema, model } from 'mongoose';
import { ILogEntry } from './ILogEntry';

const LogEntrySchema = new Schema({
    _id: {
        d: { type: Date, required: true },
        n: { type: String, required: true }
    },
    i: { type: Number, required: true },
    o: { type: Number, required: true },
    t: { type: Number, required: true }
});

export const LogEntry = model<ILogEntry>('LogEntry', LogEntrySchema);
