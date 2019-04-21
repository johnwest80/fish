import { ObjectId } from "bson";
import { Location } from '../models/LocationSchema';

export class PermissionService {
    public static async canUserAccessLocation(userId: ObjectId, locationId: string) {
        const cacheKey = this.createLocationCacheKey(userId, locationId);
        const isCached = this.locationAccessCache[cacheKey] !== undefined;
        if (!isCached) {
            this.locationAccessCache[cacheKey] = await Location.findOne({
                'users._id': userId,
                '_id': locationId
            }) !== undefined;
        }
        return this.locationAccessCache[cacheKey];
    }
    public static async canUserAccessDevice(userId: ObjectId, deviceId: string) {
        const cacheKey = this.createDeviceCacheKey(userId, deviceId);
        const isCached = this.deviceAccessCache[cacheKey] !== undefined;
        if (!isCached) {
            this.deviceAccessCache[cacheKey] = await Location.findOne({
                'users._id': userId,
                'devices.id': deviceId
            }) !== undefined;
        }
        return this.deviceAccessCache[cacheKey];
    }

    private static locationAccessCache: { [key: string]: boolean };
    private static deviceAccessCache: { [key: string]: boolean };

    private static createLocationCacheKey(userId: ObjectId, locationId: string) {
        return userId.toHexString() + '/' + locationId;
    }

    private static createDeviceCacheKey(userId: ObjectId, deviceId: string) {
        return userId.toHexString() + '/' + deviceId;
    }
}
