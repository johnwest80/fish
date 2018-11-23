"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.DeviceImageSchema = new mongoose_1.Schema({
    _id: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true, unique: false },
    primary: { type: Boolean, required: true, default: false },
});
exports.UserDeviceSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: false },
    minHeatRise: { type: Number },
    maxHeatRise: { type: Number },
    id: { type: String, required: true, unique: false },
    particleId: { type: String, required: false, unique: false },
    disabled: { type: Boolean, required: true, default: false },
    reversed: { type: Boolean, required: true, default: false },
    filterSize: { type: String },
    images: { type: [exports.DeviceImageSchema], required: false },
});
const LocationSchema = new mongoose_1.Schema({
    _id: mongoose_1.Schema.Types.ObjectId,
    name: { type: String, required: true },
    timezone: { type: String, required: true },
    zipCode: { type: String, required: true, unique: false },
    devices: { type: [exports.UserDeviceSchema], required: false },
    users: [{ _id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' } }],
    disabled: { type: Boolean, required: true, default: false }
});
exports.Location = mongoose_1.model('Location', LocationSchema);
//# sourceMappingURL=LocationSchema.js.map