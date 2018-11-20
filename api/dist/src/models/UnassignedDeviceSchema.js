"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UnassignedDeviceSchema = new mongoose_1.Schema({
    _id: mongoose_1.Schema.Types.ObjectId,
    particleId: { type: String, required: true },
    lastSeen: { type: Date, required: true }
});
exports.UnassignedDevice = mongoose_1.model('UnassignedDevice', UnassignedDeviceSchema);
//# sourceMappingURL=UnassignedDeviceSchema.js.map