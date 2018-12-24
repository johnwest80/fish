import { Request, Response, Router, NextFunction } from 'express';
import { DeviceAlert } from '../models/DeviceAlertSchema';
import { AuthenticationService, IAuthenticatedRequest } from '../services/AuthenticationService';
import { Location } from '../models/LocationSchema';
import { DeviceAlertPipelineService } from '../services/device-alert-pipeline.service';
import { IGetAlertsResult } from './deviceAlert';
import { AutomationService } from '../services/automation.service';

const router: Router = Router();

router.get('/processDevicesNotConnectedWithinXMinutes', AutomationService.verifyRequest,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const alertsProcessed = await AutomationService.processDevicesNotConnectedWithinXMinutes();
            res.send(`Alerts processed ${alertsProcessed}`);
        } catch (ex) {
            res.status(500).send(ex);
        }
    });

router.get('/sendEmail', AutomationService.verifyRequest,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const emailsSent = await AutomationService.sendEmail();
            res.send(`Test email sent ${emailsSent}`);
        } catch (ex) {
            res.status(500).send(ex);
        }
    });

export const AutomationController: Router = router;
