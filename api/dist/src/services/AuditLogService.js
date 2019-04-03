"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuditLogSchema_1 = require("../models/AuditLogSchema");
class AuditLogService {
    static createEntryForSystem(severity, entryType, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const entry = new AuditLogSchema_1.AuditLog();
            entry.isSystem = true;
            yield this.createEntry(entry, severity, entryType, message);
        });
    }
    static createEntryForCompany(companyId, severity, entryType, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const entry = new AuditLogSchema_1.AuditLog();
            entry.companyId = companyId;
            yield this.createEntry(entry, severity, entryType, message);
        });
    }
    static createEntryForUser(userId, severity, entryType, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const entry = new AuditLogSchema_1.AuditLog();
            entry.userId = userId;
            yield this.createEntry(entry, severity, entryType, message);
        });
    }
    static createEntryForLocation(locationId, severity, entryType, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const entry = new AuditLogSchema_1.AuditLog();
            entry.locationId = locationId;
            yield this.createEntry(entry, severity, entryType, message);
        });
    }
    static createEntryForDevice(deviceId, severity, entryType, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const entry = new AuditLogSchema_1.AuditLog();
            entry.deviceId = deviceId;
            yield this.createEntry(entry, severity, entryType, message);
        });
    }
    static createEntry(entry, severity, entryType, message) {
        return __awaiter(this, void 0, void 0, function* () {
            entry.d = new Date();
            entry.severity = severity;
            entry.entryType = entryType;
            entry.message = message;
            yield entry.save();
        });
    }
}
exports.AuditLogService = AuditLogService;
//# sourceMappingURL=AuditLogService.js.map