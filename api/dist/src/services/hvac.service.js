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
const bson_1 = require("bson");
const LocationSchema_1 = require("../models/LocationSchema");
const UnassignedDeviceSchema_1 = require("../models/UnassignedDeviceSchema");
class HvacService {
    getLocationForEdit(userId, locationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield LocationSchema_1.Location.findOne({
                'users._id': userId,
                '_id': locationId
            });
        });
    }
    getLocationForEditByDeviceId(userId, deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const location = yield LocationSchema_1.Location.findOne({
                'users._id': userId,
                'devices.id': deviceId
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
    getParticleIdAwaitingAdd(userId, partialDeviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (partialDeviceId.trim().length < 7) {
                throw new Error('Must enter at 7 characters to search for device');
            }
            const unassignedDevice = yield UnassignedDeviceSchema_1.UnassignedDevice.findOne({
                particleId: new RegExp('^' + partialDeviceId + '.*$', 'i'),
                lastSeen: {
                    "$gte": new Date(new Date().getTime() - (1000 * 60 * 5))
                }
            });
            if (!unassignedDevice) {
                return null;
            }
            return unassignedDevice.particleId;
        });
    }
    setDevicePropertiesFromPost(postedDevice, deviceInDb) {
        deviceInDb.name = postedDevice.name;
        deviceInDb.minHeatRise = postedDevice.minHeatRise;
        deviceInDb.maxHeatRise = postedDevice.maxHeatRise;
        deviceInDb.disabled = postedDevice.disabled;
        deviceInDb.reversed = postedDevice.reversed;
        deviceInDb.id = new bson_1.ObjectID().toHexString();
    }
}
exports.HvacService = HvacService;
//# sourceMappingURL=hvac.service.js.map