import { ObjectId, BSONRegExp } from 'bson';
import { Location } from '../models/LocationSchema';
import { ILocation } from '../models/ILocation';
import { LogEntry } from '../models/LogEntrySchema';
import { ILogEntry } from '../models/ILogEntry';
import { IDevice } from '../models/IDevice';

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

    public async getDeviceForEdit(userId: ObjectId, deviceId: string) {
        const device = (await this.getLocationForEditByDeviceId(userId, deviceId)).devices.find((d) => d.id === deviceId);
        if (!device) {
            throw new Error('Device not found');
        }
        return device;
    }

    public async getDeviceIdAwaitingAdd(userId: ObjectId, partialDeviceId: string) {
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
                    'le._id.n': new BSONRegExp('^' + partialDeviceId + '.*$', 'i'),
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

        const array = await LogEntry.aggregate(pipeline) as any;
        if (array.length === 0) {
            return null;
        }
        return ((array[0] as any).le as ILogEntry)._id.n;
    }

    public updateDeviceForSave(postedDevice: IDevice, deviceInDb: IDevice) {
        deviceInDb.name = postedDevice.name;
        deviceInDb.minHeatRise = postedDevice.minHeatRise;
        deviceInDb.maxHeatRise = postedDevice.maxHeatRise;
        deviceInDb.disabled = postedDevice.disabled;
        deviceInDb.reversed = postedDevice.reversed;
    }
}
