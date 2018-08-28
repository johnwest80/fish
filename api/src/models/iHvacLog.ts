import * as mongoose from 'mongoose';

export interface IHvacLog extends mongoose.Document {
    temperature: number;
    deviceId: string;
    accountId: string;
    groupTick: number;
    dy: number;
    mnth: number;
    yr: number;
    dt: string;
}
