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
const hvac_service_1 = require("./hvac.service");
const LocationSchema_1 = require("../models/LocationSchema");
class DeviceImageService {
    constructor() {
        this.hvacService = new hvac_service_1.HvacService();
    }
    static getAllImages(location) {
        return location.devices.reduce((prev, next) => prev.concat(next.images), []);
    }
    getImageForEdit(userId, deviceImageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const location = yield LocationSchema_1.Location.findOne({
                'users._id': userId,
                'devices.images._id': deviceImageId
            });
            if (!location) {
                throw new Error('Device image not found');
            }
            const image = DeviceImageService.getAllImages(location)
                .find((x) => x._id.equals(deviceImageId));
            return { image };
        });
    }
    getNewImageForEdit(userId, deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const location = yield this.hvacService.getLocationForEditByDeviceId(userId, deviceId);
            const image = {};
            image.primary = DeviceImageService.getAllImages(location).findIndex(x => x.primary) === -1;
            return image;
        });
    }
    saveImage(location) {
        return __awaiter(this, void 0, void 0, function* () {
            yield location.save();
        });
    }
    setDeviceImagePropertiesFromPost(device, postedDeviceImage, deviceImageForDb, existing) {
        if (!existing) {
            deviceImageForDb._id = new bson_1.ObjectId();
            deviceImageForDb.name = postedDeviceImage.name;
        }
        // turn off primary for all others
        if (postedDeviceImage.primary && device.images) {
            device.images.forEach(x => x.primary = false);
        }
        deviceImageForDb.primary = postedDeviceImage.primary;
    }
}
exports.DeviceImageService = DeviceImageService;
//# sourceMappingURL=device-image.service.js.map