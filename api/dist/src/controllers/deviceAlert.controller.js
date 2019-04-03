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
const express_1 = require("express");
const DeviceAlertSchema_1 = require("../models/DeviceAlertSchema");
const AuthenticationService_1 = require("../services/AuthenticationService");
const LocationSchema_1 = require("../models/LocationSchema");
const device_alert_pipeline_service_1 = require("../services/device-alert-pipeline.service");
const router = express_1.Router();
router.get('/alerts', AuthenticationService_1.AuthenticationService.verifyToken, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        res.send(yield LocationSchema_1.Location.aggregate(device_alert_pipeline_service_1.DeviceAlertPipelineService.getAllAlertsPipeline(req.user._id)));
    }
    catch (ex) {
        res.status(500).send(ex);
    }
}));
router.get('/alerts/:deviceId', AuthenticationService_1.AuthenticationService.verifyToken, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const deviceId = req.params.deviceId;
    try {
        const count = yield LocationSchema_1.Location.findOne({
            "users._id": req.user._id,
            "devices.id": deviceId
        }).count();
        if (count === 0) {
            throw new Error('Device not found');
        }
        const alerts = yield DeviceAlertSchema_1.DeviceAlert.find({
            "deviceId": deviceId
        }).sort({ d: 1 });
        res.send(alerts);
    }
    catch (ex) {
        res.status(500).send(ex);
    }
}));
router.put('/alerts/:alertId', AuthenticationService_1.AuthenticationService.verifyToken, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const alertId = req.params.alertId;
    const postedDevice = req.body;
    try {
        const alert = yield DeviceAlertSchema_1.DeviceAlert.findOne({
            "_id": alertId
        }).sort({ d: 1 });
        if (!alert) {
            throw new Error('Alert not found');
        }
        const count = yield LocationSchema_1.Location.findOne({
            "users._id": req.user._id,
            "devices.id": alert.deviceId
        }).count();
        if (count === 0) {
            throw new Error('Device not found');
        }
        alert.resolved = !!postedDevice.resolved;
        alert.save();
        res.send(alert);
    }
    catch (ex) {
        res.status(500).send(ex);
    }
}));
exports.DeviceAlertController = router;
//# sourceMappingURL=deviceAlert.controller.js.map