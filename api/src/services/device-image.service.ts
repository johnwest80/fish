import { ObjectId } from "bson";
import { HvacService } from './hvac.service';
import { Location } from '../models/LocationSchema';
import { IDeviceImage } from "../models/IDeviceImage";
import { ILocation } from "../models/ILocation";
import { IDevice } from "../models/IDevice";

export interface IGetImageForEditResult {
    image: IDeviceImage;
}
export class DeviceImageService {
    public static getAllImages(location: ILocation) {
        return location.devices.reduce<IDeviceImage[]>((prev, next) => prev.concat(next.images), []);
    }

    private hvacService = new HvacService();

    public async getImageForEdit(userId: ObjectId, deviceImageId: ObjectId) {
        const location = await Location.findOne({
            'users._id': userId,
            'devices.images._id': deviceImageId
        });
        if (!location) {
            throw new Error('Device image not found');
        }
        const image = DeviceImageService.getAllImages(location)
            .find((x) => x._id.equals(deviceImageId));

        return { image } as IGetImageForEditResult;
    }

    public async getNewImageForEdit(userId: ObjectId, deviceId: string) {

        const location = await this.hvacService.getLocationForEditByDeviceId(userId, deviceId);
        const image = {} as IDeviceImage;
        image.primary = DeviceImageService.getAllImages(location).findIndex(x => x.primary) === -1;

        return image;
    }

    public async saveImage(location: ILocation) {
        await location.save();
    }

    public setDeviceImagePropertiesFromPost(
        device: IDevice, postedDeviceImage: IDeviceImage, deviceImageForDb: IDeviceImage, existing: boolean) {

        if (!existing) {
            deviceImageForDb._id = new ObjectId();
            deviceImageForDb.name = postedDeviceImage.name;
        }
        // turn off primary for all others
        if (postedDeviceImage.primary && device.images) {
            device.images.forEach(x => x.primary = false);
        }
        deviceImageForDb.primary = postedDeviceImage.primary;
    }
}
