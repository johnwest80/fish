import { ObjectId } from "bson";
import { Severity } from "../models/Severity";
import { AuditLogEntryType } from "../models/AuditLogEntryType";
import { AuditLog } from '../models/AuditLogSchema';
import { IAuditLog } from "../models/IAuditLog";

export class AuditLogService {
    public static async createEntryForSystem(severity: Severity, entryType: AuditLogEntryType, message: string) {
        const entry = new AuditLog();
        entry.isSystem = true;
        await this.createEntry(entry, severity, entryType, message);
    }

    public static async createEntryForCompany(companyId: ObjectId, severity: Severity, entryType: AuditLogEntryType, message: string) {
        const entry = new AuditLog();
        entry.companyId = companyId;
        await this.createEntry(entry, severity, entryType, message);
    }

    public static async createEntryForUser(userId: ObjectId, severity: Severity, entryType: AuditLogEntryType, message: string) {
        const entry = new AuditLog();
        entry.userId = userId;
        await this.createEntry(entry, severity, entryType, message);
    }

    public static async createEntryForLocation(locationId: ObjectId, severity: Severity, entryType: AuditLogEntryType, message: string) {
        const entry = new AuditLog();
        entry.locationId = locationId;
        await this.createEntry(entry, severity, entryType, message);
    }

    public static async createEntryForDevice(deviceId: string, severity: Severity, entryType: AuditLogEntryType, message: string) {
        const entry = new AuditLog();
        entry.deviceId = deviceId;
        await this.createEntry(entry, severity, entryType, message);
    }

    private static async createEntry(entry: IAuditLog, severity: Severity, entryType: AuditLogEntryType, message: string) {
        entry.d = new Date();
        entry.severity = severity;
        entry.entryType = entryType;
        entry.message = message;

        await entry.save();
    }
}
