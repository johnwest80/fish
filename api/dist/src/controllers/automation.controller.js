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
const automation_service_1 = require("../services/automation.service");
const AuditLogService_1 = require("../services/AuditLogService");
const router = express_1.Router();
router.get('/processDevicesNotConnectedWithinXMinutes', automation_service_1.AutomationService.verifyRequest, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const alertsProcessed = yield automation_service_1.AutomationService.processDevicesNotConnectedWithinXMinutes();
        const msg = `Alerts processed ${alertsProcessed}`;
        AuditLogService_1.AuditLogService.createEntryForSystem("Success", "NonResponsiveDeviceProcessing", msg);
        res.send(msg);
    }
    catch (ex) {
        AuditLogService_1.AuditLogService.createEntryForSystem("Error", "NonResponsiveDeviceProcessing", ex.toString());
        res.status(500).send(ex);
    }
}));
router.get('/processDevicesWithTempOutOfRange', automation_service_1.AutomationService.verifyRequest, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const alertsProcessed = yield automation_service_1.AutomationService.processDevicesWithTempOutOfRange();
        const msg = `Alerts processed ${alertsProcessed}`;
        AuditLogService_1.AuditLogService.createEntryForSystem("Success", "DevicesWithTempOutOfRangeProcessing", msg);
        res.send(msg);
    }
    catch (ex) {
        AuditLogService_1.AuditLogService.createEntryForSystem("Error", "DevicesWithTempOutOfRangeProcessing", ex.toString());
        res.status(500).send(ex);
    }
}));
router.get('/sendEmail', automation_service_1.AutomationService.verifyRequest, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const emailsSent = yield automation_service_1.AutomationService.sendEmail();
        const msg = `Automation emails sent ${emailsSent}`;
        AuditLogService_1.AuditLogService.createEntryForSystem("Success", "AutomationEmails", msg);
        res.send(msg);
    }
    catch (ex) {
        AuditLogService_1.AuditLogService.createEntryForSystem("Error", "AutomationEmails", ex.toString());
        res.status(500).send(ex);
    }
}));
exports.AutomationController = router;
//# sourceMappingURL=automation.controller.js.map