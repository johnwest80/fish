"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const HvacLogSchema = new mongoose_1.Schema({
    temperature: { type: Number, required: true },
    deviceId: { type: String, required: true, unique: false },
    accountId: { type: String, required: true },
    groupTick: { type: Number, required: true },
    dy: { type: Number, required: true },
    mnth: { type: Number, required: true },
    yr: { type: Number, required: true },
    dt: { type: String, required: true },
});
exports.HvacLog = mongoose_1.model('HvacLog', HvacLogSchema);
//# sourceMappingURL=hvacLog.js.map