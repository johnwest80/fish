import { Request, Response, Router, NextFunction } from 'express';
import { IUser } from '../models/iuser';
import { AuthenticationService, IAuthenticatedRequest } from '../services/AuthenticationService';
import * as azure from 'azure-storage';
import { ObjectID, ObjectId } from 'bson';
import * as path from 'path';
import { DeviceImageService } from '../services/device-image.service';
import { HvacService } from '../services/hvac.service';
import { ILocation } from '../models/ILocation';
import { IDeviceImage } from '../models/IDeviceImage';
import { IDevice } from '../models/IDevice';

const imageContainer = 'images';

const router: Router = Router();

const imageTypes = ['.jpg', '.jpeg', '.png'];

const imageService = new DeviceImageService();

router.get('/sas/:name', AuthenticationService.verifyToken, (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
    let blobService: azure.BlobService;
    try {
        blobService = azure.createBlobService('UseDevelopmentStorage=true');
    } catch (ex) {
        res.send(ex.toString());
        return;
    }

    const ext = path.extname(req.params.name).toLowerCase();

    if (imageTypes.indexOf(ext) === -1) {
        throw new Error('Only these files are supported: ' + imageTypes.join(', '));
    }

    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + 10);
    startDate.setMinutes(startDate.getMinutes() - 100);

    const sharedAccessPolicy = {
        AccessPolicy: {
            Permissions: azure.BlobUtilities.SharedAccessPermissions.WRITE,
            Start: startDate,
            Expiry: expiryDate
        }
    };

    const filename = new ObjectID().toHexString() + ext;

    blobService.createContainerIfNotExists(imageContainer, {
        publicAccessLevel: 'blob'
    }, (error, result, response) => {
        if (!error) {
            // if result = true, container was created.
            // if result = false, container already existed.

            const token = blobService.generateSharedAccessSignature(imageContainer, filename, sharedAccessPolicy);
            const sasUrl = blobService.getUrl(imageContainer, filename, token);

            res.send({ sasUrl, filename });
        } else {
            res.send(error.toString());
        }
    });
});

router.get('/new/:deviceId', AuthenticationService.verifyToken, async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        res.send(await imageService.getNewImageForEdit(req.user._id, req.params.deviceId));
    } catch (ex) {
        res.status(500).send(ex);
    }
});

router.get('/existing/:deviceImageId', AuthenticationService.verifyToken,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const result = await imageService.getImageForEdit(req.user._id, new ObjectId(req.params.deviceImageId));
            res.send(result.image);
        } catch (ex) {
            res.status(500).send(ex);
        }
    });

router.put('/imageEdit', AuthenticationService.verifyToken,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        const hvacService = new HvacService();

        const deviceImageId = req.body._id;
        const postedDeviceImage = req.body as IDeviceImage;

        try {
            let locationInDb = await hvacService.getLocationForEditByDeviceImageId(req.user._id, deviceImageId) as ILocation;
            if (locationInDb === null) {
                return res.status(404).send();
            }
            const deviceInDb = locationInDb.devices
                .find(x => x.images.find(y => y._id.equals(new ObjectId(deviceImageId))) != null) as IDevice;
            if (deviceInDb === undefined) {
                return res.status(404).send();
            }

            const deviceImageInDb = deviceInDb.images.find(x => x._id.equals(new ObjectId(deviceImageId)));
            if (deviceImageInDb === undefined) {
                return res.status(404).send();
            }

            imageService.setDeviceImagePropertiesFromPost(deviceInDb, postedDeviceImage, deviceImageInDb, true);

            locationInDb = await locationInDb.save();

            return res.send(locationInDb);
        } catch (ex) {
            res.status(500).send(ex);
        }
    });

router.post('/imageEdit/:deviceId', AuthenticationService.verifyToken,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        const hvacService = new HvacService();
        const deviceImageService = new DeviceImageService();

        const deviceId = req.params.deviceId;
        const postedDeviceImage = req.body as IDeviceImage;

        try {
            let locationInDb = await hvacService.getLocationForEditByDeviceId(req.user._id, deviceId) as ILocation;
            if (locationInDb === null) {
                return res.status(404).send();
            }
            const deviceInDb = locationInDb.devices.find(x => x.id === deviceId) as IDevice;

            const newDeviceImage = await deviceImageService.getNewImageForEdit(req.user._id, deviceId);

            imageService.setDeviceImagePropertiesFromPost(deviceInDb, postedDeviceImage, newDeviceImage, false);
            if (!deviceInDb.images) {
                deviceInDb.images = [];
            }
            deviceInDb.images.push(newDeviceImage);

            locationInDb = await locationInDb.save();

            return res.send(locationInDb);
        } catch (ex) {
            res.status(500).send(ex);
        }
    });

// Export the express.Router() instance to be used by server.ts
export const ImageController: Router = router;
