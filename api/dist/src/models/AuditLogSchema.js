"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AuditLogSchema = new mongoose_1.Schema({
    d: { type: Date, required: true },
    isSystem: { type: Boolean, required: true, default: false },
    companyId: { type: mongoose_1.Schema.Types.ObjectId },
    userId: { type: mongoose_1.Schema.Types.ObjectId },
    locationId: { type: mongoose_1.Schema.Types.ObjectId },
    deviceId: { type: String },
    severity: { type: String, required: true },
    entryType: { type: String, required: true },
    message: { type: String }
});
exports.AuditLog = mongoose_1.model('AuditLog', AuditLogSchema);
//# sourceMappingURL=AuditLogSchema.js.map