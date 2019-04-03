"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const DeviceAlertSchema = new mongoose_1.Schema({
    _id: mongoose_1.Schema.Types.ObjectId,
    deviceId: { type: String, required: true },
    d: { type: Date, required: true },
    alertCode: { type: String, required: true },
    message: { type: String, required: true },
    resolved: { type: Boolean },
    resolvedDate: { type: Date },
    emailSent: { type: Boolean },
    emailSentDate: { type: Date }
});
exports.DeviceAlert = mongoose_1.model('DeviceAlert', DeviceAlertSchema);
//# sourceMappingURL=DeviceAlertSchema.js.map