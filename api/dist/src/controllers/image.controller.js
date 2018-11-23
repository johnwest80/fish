"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthenticationService_1 = require("../services/AuthenticationService");
const azure = __importStar(require("azure-storage"));
const bson_1 = require("bson");
const path = __importStar(require("path"));
const device_image_service_1 = require("../services/device-image.service");
const hvac_service_1 = require("../services/hvac.service");
const imageContainer = 'images';
const router = express_1.Router();
const imageTypes = ['.jpg', '.jpeg', '.png'];
const imageService = new device_image_service_1.DeviceImageService();
router.get('/sas/:name', AuthenticationService_1.AuthenticationService.verifyToken, (req, res, next) => {
    let blobService;
    try {
        blobService = azure.createBlobService();
    }
    catch (ex) {
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
    const filename = new bson_1.ObjectID().toHexString() + ext;
    blobService.createContainerIfNotExists(imageContainer, {
        publicAccessLevel: 'blob'
    }, (error, result, response) => {
        if (!error) {
            // if result = true, container was created.
            // if result = false, container already existed.
            const token = blobService.generateSharedAccessSignature(imageContainer, filename, sharedAccessPolicy);
            const sasUrl = blobService.getUrl(imageContainer, filename, token);
            res.send({ sasUrl, filename });
        }
        else {
            res.send(error.toString());
        }
    });
});
router.get('/new/:deviceId', AuthenticationService_1.AuthenticationService.verifyToken, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        res.send(yield imageService.getNewImageForEdit(req.user._id, req.params.deviceId));
    }
    catch (ex) {
        res.status(500).send(ex);
    }
}));
router.get('/existing/:deviceImageId', AuthenticationService_1.AuthenticationService.verifyToken, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const result = yield imageService.getImageForEdit(req.user._id, new bson_1.ObjectId(req.params.deviceImageId));
        res.send(result.image);
    }
    catch (ex) {
        res.status(500).send(ex);
    }
}));
router.put('/imageEdit', AuthenticationService_1.AuthenticationService.verifyToken, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const hvacService = new hvac_service_1.HvacService();
    const deviceImageId = req.body._id;
    const postedDeviceImage = req.body;
    try {
        let locationInDb = yield hvacService.getLocationForEditByDeviceImageId(req.user._id, deviceImageId);
        if (locationInDb === null) {
            return res.status(404).send();
        }
        const deviceInDb = locationInDb.devices
            .find(x => x.images.find(y => y._id.equals(new bson_1.ObjectId(deviceImageId))) != null);
        if (deviceInDb === undefined) {
            return res.status(404).send();
        }
        const deviceImageInDb = deviceInDb.images.find(x => x._id.equals(new bson_1.ObjectId(deviceImageId)));
        if (deviceImageInDb === undefined) {
            return res.status(404).send();
        }
        imageService.setDeviceImagePropertiesFromPost(deviceInDb, postedDeviceImage, deviceImageInDb, true);
        locationInDb = yield locationInDb.save();
        return res.send(locationInDb);
    }
    catch (ex) {
        res.status(500).send(ex);
    }
}));
router.post('/imageEdit/:deviceId', AuthenticationService_1.AuthenticationService.verifyToken, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const hvacService = new hvac_service_1.HvacService();
    const deviceImageService = new device_image_service_1.DeviceImageService();
    const deviceId = req.params.deviceId;
    const postedDeviceImage = req.body;
    try {
        let locationInDb = yield hvacService.getLocationForEditByDeviceId(req.user._id, deviceId);
        if (locationInDb === null) {
            return res.status(404).send();
        }
        const deviceInDb = locationInDb.devices.find(x => x.id === deviceId);
        const newDeviceImage = yield deviceImageService.getNewImageForEdit(req.user._id, deviceId);
        imageService.setDeviceImagePropertiesFromPost(deviceInDb, postedDeviceImage, newDeviceImage, false);
        if (!deviceInDb.images) {
            deviceInDb.images = [];
        }
        deviceInDb.images.push(newDeviceImage);
        locationInDb = yield locationInDb.save();
        return res.send(locationInDb);
    }
    catch (ex) {
        res.status(500).send(ex);
    }
}));
// Export the express.Router() instance to be used by server.ts
exports.ImageController = router;
//# sourceMappingURL=image.controller.js.map