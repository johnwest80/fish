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
const LocationSchema_1 = require("../models/LocationSchema");
class HvacService {
    getLocationForEdit(userId, locationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield LocationSchema_1.Location.findOne({
                "users._id": userId,
                "_id": locationId
            });
        });
    }
    getLocationForEditByDeviceId(userId, deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const location = yield LocationSchema_1.Location.findOne({
                "users._id": userId,
                "devices.id": deviceId
            });
            if (!location) {
                throw new Error('Location not found');
            }
            return location;
        });
    }
    getDeviceForEdit(userId, deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const device = (yield this.getLocationForEditByDeviceId(userId, deviceId)).devices.find((d) => d.id === deviceId);
            if (!device) {
                throw new Error('Device not found');
            }
            return device;
        });
    }
}
exports.HvacService = HvacService;
//# sourceMappingURL=hvac.service.js.map