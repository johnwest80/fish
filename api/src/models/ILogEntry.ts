import * as mongoose from 'mongoose';

export interface ILogEntryId {
    d: number;
    n: string;
}
export interface ILogEntry extends mongoose.Document {
    _id: ILogEntryId;
    i: number;
    o: number;
    t: number;
    start: boolean;
    end: boolean;
    startUnsure: boolean;
    endUnsure: boolean;
}
