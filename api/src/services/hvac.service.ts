import { ObjectId, BSONRegExp, ObjectID, BSON } from 'bson';
import { Location } from '../models/LocationSchema';
import { ILocation } from '../models/ILocation';
import { LogEntry } from '../models/LogEntrySchema';
import { ILogEntry, ILogEntryId } from '../models/ILogEntry';
import { IDevice } from '../models/IDevice';
import { UnassignedDevice } from '../models/UnassignedDeviceSchema';

export interface IStartEndResult extends ILogEntry {
    start: boolean;
    end: boolean;
    minusOne: {
        t: number;
    };
    minusTwo: {
        t: number;
    };
}
export class HvacService {
    public async getLocationForEdit(userId: ObjectId, locationId: string) {
        return await Location.findOne({
            'users._id': userId,
            '_id': locationId
        });
    }

    public async getLocationForEditByDeviceId(userId: ObjectId, deviceId: string) {
        const location = await Location.findOne({
            'users._id': userId,
            'devices.id': deviceId
        });
        if (!location) {
            throw new Error('Location not found');
        }
        return location;
    }

    public async getLocationForEditByDeviceImageId(userId: ObjectId, deviceImageId: string) {
        const location = await Location.findOne({
            'users._id': userId,
            'devices.images._id': new ObjectId(deviceImageId)
        });
        if (!location) {
            throw new Error('Location not found');
        }
        return location;
    }

    public async getDeviceForEdit(userId: ObjectId, deviceId: string) {
        const device = (await this.getLocationForEditByDeviceId(userId, deviceId)).devices.find((d) => d.id === deviceId);
        if (!device) {
            throw new Error('Device not found');
        }
        return device;
    }

    public async getParticleIdAwaitingAdd(userId: ObjectId, partialDeviceId: string) {
        if (partialDeviceId.trim().length < 6) {
            throw new Error('Must enter at 6 characters to search for device');
        }
        const unassignedDevice = await UnassignedDevice.findOne({
            particleId: new RegExp('^' + partialDeviceId + '.*$', 'i'),
            lastSeen: {
                "$gte": new Date(new Date().getTime() - (1000 * 60 * 5))
            }
        });

        if (!unassignedDevice) {
            return null;
        }
        return unassignedDevice.particleId;
    }

    public setDevicePropertiesFromPost(postedDevice: IDevice, deviceInDb: IDevice) {
        deviceInDb.name = postedDevice.name;
        deviceInDb.minHeatRise = postedDevice.minHeatRise;
        deviceInDb.maxHeatRise = postedDevice.maxHeatRise;
        deviceInDb.disabled = postedDevice.disabled;
        deviceInDb.reversed = postedDevice.reversed;
        deviceInDb.filterSize = postedDevice.filterSize;
        deviceInDb.baseline = {
            heat: postedDevice.baseline.heat,
            cool: postedDevice.baseline.cool,
            tolerancePercent: postedDevice.baseline.tolerancePercent
        };
        deviceInDb.detectLeaksOnClosedPin = postedDevice.detectLeaksOnClosedPin;
    }
}
