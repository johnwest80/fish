import { Schema, model } from "mongoose";
import { IAuditLog } from "./IAuditLog";

const AuditLogSchema = new Schema({
    d: { type: Date, required: true },
    isSystem: { type: Boolean, required: true, default: false },
    companyId: { type: Schema.Types.ObjectId },
    userId: { type: Schema.Types.ObjectId },
    locationId: { type: Schema.Types.ObjectId },
    deviceId: { type: String },
    severity: { type: String, required: true },
    entryType: { type: String, required: true },
    message: { type: String }
});

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);
