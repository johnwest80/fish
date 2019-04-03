import { Response, Router, NextFunction } from 'express';
import { DeviceAlert } from '../models/DeviceAlertSchema';
import { AuthenticationService, IAuthenticatedRequest } from '../services/AuthenticationService';
import { Location } from '../models/LocationSchema';
import { DeviceAlertPipelineService } from '../services/device-alert-pipeline.service';
import { IGetAlertsResult } from './deviceAlert';
import { AlertCode } from '../models/AlertCode';

const router: Router = Router();
export interface IPostedAlert {
    resolved: boolean;
}

export interface IAlertSummaryResult {
    deviceAlert: {
        alertCode: AlertCode
    };
    total: number;
}

router.get('/alerts', AuthenticationService.verifyToken,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            res.send(await Location.aggregate(DeviceAlertPipelineService.getAllAlertsPipeline(req.user._id)) as IGetAlertsResult[]);
        } catch (ex) {
            res.status(500).send(ex);
        }
    });

router.get('/alerts/:deviceId', AuthenticationService.verifyToken,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        const deviceId = req.params.deviceId;

        try {
            const count = await Location.findOne({
                "users._id": req.user._id,
                "devices.id": deviceId
            }).count();

            if (count === 0) {
                throw new Error('Device not found');
            }

            const alerts = await DeviceAlert.find({
                "deviceId": deviceId
            }).sort({ d: 1 });

            res.send(alerts);
        } catch (ex) {
            res.status(500).send(ex);
        }
    });

router.put('/alerts/:alertId', AuthenticationService.verifyToken,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        const alertId = req.params.alertId;
        const postedDevice = req.body as IPostedAlert;

        try {
            const alert = await DeviceAlert.findOne({
                "_id": alertId
            }).sort({ d: 1 });

            if (!alert) {
                throw new Error('Alert not found');
            }

            const count = await Location.findOne({
                "users._id": req.user._id,
                "devices.id": alert.deviceId
            }).count();

            if (count === 0) {
                throw new Error('Device not found');
            }

            alert.resolved = !!postedDevice.resolved;
            alert.save();
            res.send(alert);
        } catch (ex) {
            res.status(500).send(ex);
        }
    });

export const DeviceAlertController: Router = router;
