import { Request, Response, Router, NextFunction } from 'express';
import { DeviceAlert } from '../models/DeviceAlertSchema';
import { AuthenticationService, IAuthenticatedRequest } from '../services/AuthenticationService';
import { Location } from '../models/LocationSchema';
import { DeviceAlertPipelineService } from '../services/device-alert-pipeline.service';
import { IGetAlertsResult } from './deviceAlert';
import { AutomationService } from '../services/automation.service';
import { AuditLogService } from '../services/AuditLogService';
import { Severity } from '../models/Severity';
import { AuditLogEntryType } from '../models/AuditLogEntryType';

const router: Router = Router();

router.get('/processDevicesNotConnectedWithinXMinutes', AutomationService.verifyRequest,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const alertsProcessed = await AutomationService.processDevicesNotConnectedWithinXMinutes();
            const msg = `Alerts processed ${alertsProcessed}`;
            AuditLogService.createEntryForSystem("Success", "NonResponsiveDeviceProcessing", msg);
            res.send(msg);
        } catch (ex) {
            AuditLogService.createEntryForSystem("Error", "NonResponsiveDeviceProcessing", ex.toString());
            res.status(500).send(ex);
        }
    });

router.get('/processDevicesWithTempOutOfRange', AutomationService.verifyRequest,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const alertsProcessed = await AutomationService.processDevicesWithTempOutOfRange();
            const msg = `Alerts processed ${alertsProcessed}`;
            AuditLogService.createEntryForSystem("Success", "DevicesWithTempOutOfRangeProcessing", msg);
            res.send(msg);
        } catch (ex) {
            AuditLogService.createEntryForSystem("Error", "DevicesWithTempOutOfRangeProcessing", ex.toString());
            res.status(500).send(ex);
        }
    });

router.get('/sendEmail', AutomationService.verifyRequest,
    async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const emailsSent = await AutomationService.sendEmail();
            const msg = `Automation emails sent ${emailsSent}`;
            AuditLogService.createEntryForSystem("Success", "AutomationEmails", msg);
            res.send(msg);
        } catch (ex) {
            AuditLogService.createEntryForSystem("Error", "AutomationEmails", ex.toString());
            res.status(500).send(ex);
        }
    });

export const AutomationController: Router = router;
