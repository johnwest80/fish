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
const device_alert_pipeline_service_1 = require("./device-alert-pipeline.service");
const temp_out_of_range_alert_pipeline_service_1 = require("./temp-out-of-range-alert-pipeline.service");
const mongodb_1 = require("mongodb");
const LocationSchema_1 = require("../models/LocationSchema");
const DeviceAlertSchema_1 = require("../models/DeviceAlertSchema");
const email_service_1 = require("./email.service");
const AlertCode_1 = require("../models/AlertCode");
class AutomationService {
    static verifyRequest(req, res, next) {
        const securityKey = req.query.securityKey;
        if (!securityKey) {
            return res.status(403).send({ auth: false, message: 'No security key provided.' });
        }
        if (securityKey && securityKey.trim().length > 10 && securityKey === process.env.securityKey) {
            next();
        }
        else {
            return res.status(401).send('Security key incorrect.');
        }
    }
    static processDevicesNotConnectedWithinXMinutes() {
        return __awaiter(this, void 0, void 0, function* () {
            const minutes = 15;
            const pipeline = device_alert_pipeline_service_1.DeviceAlertPipelineService.findDevicesNotConnectedWithinXMinutes(minutes);
            const alerts = yield LocationSchema_1.Location.aggregate(pipeline);
            let alertsProcessed = 0;
            for (const alert of alerts) {
                const deviceAlert = new DeviceAlertSchema_1.DeviceAlert();
                deviceAlert._id = new mongodb_1.ObjectId();
                deviceAlert.deviceId = alert.device.id;
                deviceAlert.d = new Date();
                deviceAlert.alertCode = AlertCode_1.AlertCode.NotResponsive;
                deviceAlert.message = `Device not seen in at least ${minutes} minutes`;
                yield deviceAlert.save();
                alertsProcessed++;
            }
            return alertsProcessed;
        });
    }
    static processDevicesIndicatingLeakStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const minutes = 15;
            const pipeline = device_alert_pipeline_service_1.DeviceAlertPipelineService.findDevicesNotConnectedWithinXMinutes(minutes);
            const alerts = yield LocationSchema_1.Location.aggregate(pipeline);
            let alertsProcessed = 0;
            for (const alert of alerts) {
                const deviceAlert = new DeviceAlertSchema_1.DeviceAlert();
                deviceAlert._id = new mongodb_1.ObjectId();
                deviceAlert.deviceId = alert.device.id;
                deviceAlert.d = new Date();
                deviceAlert.alertCode = AlertCode_1.AlertCode.NotResponsive;
                deviceAlert.message = `Device not seen in at least ${minutes} minutes`;
                yield deviceAlert.save();
                alertsProcessed++;
            }
            return alertsProcessed;
        });
    }
    static processDevicesWithTempOutOfRange() {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = temp_out_of_range_alert_pipeline_service_1.TempOutOfRangeAlertPipelineService.getTempOutOfRangeAlertPipeline();
            const alerts = yield LocationSchema_1.Location.aggregate(pipeline);
            let alertsProcessed = 0;
            for (const item of alerts) {
                if ((item.ends._id === 'heat' && (Math.abs(item.ends.minMinT) > Math.abs(item.devices.baseline.heat) * (1 + item.devices.baseline.tolerancePercent / 100) ||
                    Math.abs(item.ends.minMinT) < Math.abs(item.devices.baseline.heat) * (1 - item.devices.baseline.tolerancePercent / 100))) || (item.ends._id === 'cool' && (Math.abs(item.ends.maxMaxT) > Math.abs(item.devices.baseline.cool) * (1 + item.devices.baseline.tolerancePercent / 100) ||
                    Math.abs(item.ends.maxMaxT) < Math.abs(item.devices.baseline.cool) * (1 - item.devices.baseline.tolerancePercent / 100)))) {
                    const deviceAlert = new DeviceAlertSchema_1.DeviceAlert();
                    deviceAlert._id = new mongodb_1.ObjectId();
                    deviceAlert.deviceId = item.devices.id;
                    deviceAlert.d = new Date();
                    deviceAlert.alertCode = 'outsideOfTempRange';
                    deviceAlert.message = `The max ${item.ends._id} temperature of ` +
                        `of ${Math.round((item.ends._id === 'heat' ?
                            Math.abs(item.ends.minMinT) : Math.abs(item.ends.maxMaxT)) * 100) / 100} ` +
                        `reached by this device is outside the range ` +
                        `of ${item.ends._id === 'heat' ? Math.abs(item.devices.baseline.heat) : Math.abs(item.devices.baseline.cool)}` +
                        ` +- ${item.devices.baseline.tolerancePercent}%`;
                    yield deviceAlert.save();
                    alertsProcessed++;
                }
            }
            return alertsProcessed;
        });
    }
    static sendEmail() {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = device_alert_pipeline_service_1.DeviceAlertPipelineService.findAlertsToEmail();
            const alerts = yield LocationSchema_1.Location.aggregate(pipeline);
            let emailsSent = 0;
            for (const alert of alerts) {
                const msg = {
                    to: alert.userinfo.email,
                    from: 'noreply@orbaco.com',
                    subject: `${alert.alert.resolved ? 'Resolved: ' : ''}
                Device alert (${alert.alert.alertCode}) on ${alert.device.name} at ${alert.location.name}`,
                    text: `${alert.alert.message}`,
                };
                yield email_service_1.EmailService.sendEmail(msg);
                yield DeviceAlertSchema_1.DeviceAlert.update({ _id: alert.alert._id }, { $set: { emailSent: true, emailSentDate: new Date() } });
                emailsSent++;
            }
            return emailsSent;
        });
    }
}
exports.AutomationService = AutomationService;
//# sourceMappingURL=automation.service.js.map