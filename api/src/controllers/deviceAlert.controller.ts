import { Request, Response, Router, NextFunction } from 'express';
import { LogEntry } from '../models/LogEntrySchema';
import { DeviceAlert } from '../models/DeviceAlertSchema';
import { CalendarMinute } from '../models/CalendarMinuteSchema';
import { AuthenticationService, IAuthenticatedRequest } from '../services/AuthenticationService';
import { HvacService } from '../services/hvac.service';
import { ILocation } from '../models/ILocation';
import { IDevice } from '../models/IDevice';
import { ObjectId, ObjectID } from 'bson';
import { IUser } from '../models/iuser';
import { Location } from '../models/LocationSchema';
import { DeviceAlertPipelineService } from '../services/device-alert-pipeline.service';
import { IGetAlertsResult } from './deviceAlert';

const router: Router = Router();
export enum AlertCode {
    LowReturnTemp
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

export const DeviceAlertController: Router = router;
