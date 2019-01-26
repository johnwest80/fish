import { Response, Request, NextFunction } from 'express';
import { DeviceAlertPipelineService } from './device-alert-pipeline.service';
import { TempOutOfRangeAlertPipelineService } from './temp-out-of-range-alert-pipeline.service';
import { ObjectID, ObjectId } from 'mongodb';
import { Location } from '../models/LocationSchema';
import { DeviceAlert } from '../models/DeviceAlertSchema';
import { EmailService } from './email.service';
import { IDeviceAlert } from '../models/IDeviceAlert';
import { IAlertMeta } from '../models/IAlertMeta';
import { IDevice } from '../models/IDevice';

interface IDevicesNotConnected {
    d: Date;
    location: {
        _id: ObjectID,
        name: string,
        timezone: string
    };
    device: {
        id: string,
        name: string
    };
}

interface IDevicesWithTempOutOfRange {
    devices: IDevice;
    ends: {
        _id: string;
        minMinT: number;
        maxMaxT: number;
        avgMinT: number;
        avgMaxT: number;
        numMinutes: number;
        numCycles: number;
    };
}

interface IAlertsToSend {
    location: {
        _id: ObjectID,
        name: string,
        timezone: string
    };
    device: {
        id: string,
        name: string
    };
    alert: IDeviceAlert;
    alertMeta: IAlertMeta;
    userinfo: {
        email: string;
        name: string;
    };
}

export class AutomationService {
    public static verifyRequest(req: Request, res: Response, next: NextFunction) {
        const securityKey = req.query.securityKey;
        if (!securityKey) {
            return res.status(403).send({ auth: false, message: 'No security key provided.' });
        }
        if (securityKey && securityKey.trim().length > 10 && securityKey === process.env.securityKey) {
            next();
        } else {
            return res.status(401).send('Security key incorrect.');
        }
    }

    public static async processDevicesNotConnectedWithinXMinutes() {
        const minutes = 15;
        const pipeline = DeviceAlertPipelineService.findDevicesNotConnectedWithinXMinutes(minutes);
        const alerts = await Location.aggregate(pipeline) as IDevicesNotConnected[];
        let alertsProcessed = 0;
        for (const alert of alerts) {
            const deviceAlert = new DeviceAlert();
            deviceAlert._id = new ObjectId();
            deviceAlert.deviceId = alert.device.id;
            deviceAlert.d = new Date();
            deviceAlert.alertCode = 'notResponsive';
            deviceAlert.message = `Device not seen in at least ${minutes} minutes`;
            await deviceAlert.save();
            alertsProcessed++;
        }
        return alertsProcessed;
    }

    public static async processDevicesWithTempOutOfRange() {
        const pipeline = TempOutOfRangeAlertPipelineService.getTempOutOfRangeAlertPipeline();
        const alerts = await Location.aggregate(pipeline) as IDevicesWithTempOutOfRange[];
        let alertsProcessed = 0;

        for (const item of alerts) {
            if ((item.ends._id === 'heat' && (
                Math.abs(item.ends.minMinT) > Math.abs(item.devices.baseline.heat) * (1 + item.devices.baseline.tolerancePercent / 100) ||
                Math.abs(item.ends.minMinT) < Math.abs(item.devices.baseline.heat) * (1 - item.devices.baseline.tolerancePercent / 100)
            )) || (item.ends._id === 'cool' && (
                Math.abs(item.ends.maxMaxT) > Math.abs(item.devices.baseline.cool) * (1 + item.devices.baseline.tolerancePercent / 100) ||
                Math.abs(item.ends.maxMaxT) < Math.abs(item.devices.baseline.cool) * (1 - item.devices.baseline.tolerancePercent / 100)
            )
                )) {
                const deviceAlert = new DeviceAlert();
                deviceAlert._id = new ObjectId();
                deviceAlert.deviceId = item.devices.id;
                deviceAlert.d = new Date();
                deviceAlert.alertCode = 'outsideOfTempRange';
                deviceAlert.message = `The max ${item.ends._id} temperature of ` +
                    `of ${item.ends._id === 'heat' ? Math.abs(item.ends.minMinT) : Math.abs(item.ends.maxMaxT)}` +
                    `reached by this device is outside the range ` +
                    `of ${item.ends._id === 'heat' ? Math.abs(item.devices.baseline.heat) : Math.abs(item.devices.baseline.cool)}` +
                    ` +- ${item.devices.baseline.tolerancePercent}%`;
                await deviceAlert.save();
                alertsProcessed++;
            }
        }
        return alertsProcessed;
    }

    public static async sendEmail() {
        const pipeline = DeviceAlertPipelineService.findAlertsToEmail();
        const alerts = await Location.aggregate(pipeline) as IAlertsToSend[];

        let emailsSent = 0;
        for (const alert of alerts) {
            const msg = {
                to: alert.userinfo.email,
                from: 'noreply@orbaco.com',
                subject: `${alert.alert.resolved ? 'Resolved: ' : ''}
                Device alert (${alert.alert.alertCode}) on ${alert.device.name} at ${alert.location.name}`,
                text: `${alert.alert.message}`,
            };
            await EmailService.sendEmail(msg);

            await DeviceAlert.update({ _id: alert.alert._id }, { $set: { emailSent: true, emailSentDate: new Date() } });

            emailsSent++;
        }
        return emailsSent;
    }
}
