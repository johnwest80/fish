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
class EmailService {
    static sendEmail(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.SENDGRID_SANDBOX) {
                msg.mail_settings = { sandbox_mode: { enable: true } };
            }
            const p = new Promise((resolve, reject) => {
                const email = require('@sendgrid/mail');
                email.setApiKey(process.env.SENDGRID_API_KEY);
                email.send(msg, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
            return p;
        });
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=email.service.js.map