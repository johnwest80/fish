import { ObjectID, ObjectId } from "bson";
import { Severity } from "./Severity";
import { AuditLogEntryType } from "./AuditLogEntryType";
import * as mongoose from 'mongoose';

export interface IAuditLog extends mongoose.Document {
    d: Date;
    isSystem: boolean;
    companyId?: ObjectID;
    userId?: ObjectID;
    locationId?: ObjectID;
    deviceId?: string;
    severity: Severity;
    entryType: AuditLogEntryType;
    message: string;
}
