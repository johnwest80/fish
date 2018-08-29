import * as mongoose from 'mongoose';

export interface ILogEntry extends mongoose.Document {
    _id: {
        d: number;
        n: string;
    };
    i: number;
    o: number;
    t: number;
}
