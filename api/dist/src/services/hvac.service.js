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
const LogEntrySchema_1 = require("../models/LogEntrySchema");
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
    getDeviceIdAwaitingAdd(userId, partialDeviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (partialDeviceId.trim().length < 7) {
                throw new Error('Must enter at 7 characters to search for device');
            }
            const pipeline = [
                {
                    '$project': {
                        '_id': 0,
                        'le': '$$ROOT'
                    }
                },
                {
                    '$lookup': {
                        'localField': 'le._id.n',
                        'from': 'locations',
                        'foreignField': 'devices.id',
                        'as': 'l'
                    }
                },
                {
                    '$unwind': {
                        'path': '$l',
                        'preserveNullAndEmptyArrays': true
                    }
                },
                {
                    '$match': {
                        'le._id.n': new bson_1.BSONRegExp('^' + partialDeviceId + '.*$', 'i'),
                        'l.name': null
                    }
                },
                {
                    '$project': {
                        'le._id.n': '$le._id.n'
                    }
                },
                {
                    '$limit': 1
                }
            ];
            const array = yield LogEntrySchema_1.LogEntry.aggregate(pipeline);
            if (array.length === 0) {
                return null;
            }
            return array[0].le._id.n;
        });
    }
    updateDeviceForSave(postedDevice, deviceInDb) {
        deviceInDb.name = postedDevice.name;
        deviceInDb.minHeatRise = postedDevice.minHeatRise;
        deviceInDb.maxHeatRise = postedDevice.maxHeatRise;
        deviceInDb.disabled = postedDevice.disabled;
        deviceInDb.reversed = postedDevice.reversed;
    }
}
exports.HvacService = HvacService;
//# sourceMappingURL=hvac.service.js.map