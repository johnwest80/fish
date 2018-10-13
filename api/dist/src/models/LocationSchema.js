"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserDeviceSchema = new mongoose_1.Schema({
    _id: mongoose_1.Schema.Types.ObjectId,
    name: { type: String, required: true, unique: false },
    id: { type: String, required: true, unique: false }
});
const LocationSchema = new mongoose_1.Schema({
    _id: mongoose_1.Schema.Types.ObjectId,
    name: { type: String, required: true },
    timezone: { type: String, required: true },
    devices: { type: [UserDeviceSchema], required: false },
    users: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'users' }]
});
exports.Location = mongoose_1.model('locations', LocationSchema);
//# sourceMappingURL=LocationSchema.js.map