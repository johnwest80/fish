import { ObjectId } from 'bson';
import { Location } from '../models/LocationSchema';
import { ILocation } from '../models/ILocation';

export class HvacService {
    public async getLocationForEdit(userId: ObjectId, locationId: string) {
        return await Location.findOne({
            "users._id": userId,
            "_id": locationId
        });
    }

    public async getLocationForEditByDeviceId(userId: ObjectId, deviceId: string) {
        const location = await Location.findOne({
            "users._id": userId,
            "devices.id": deviceId
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
}
