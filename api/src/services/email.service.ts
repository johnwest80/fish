export class EmailService {
    public static async sendEmail(msg: any) {
        if (process.env.SENDGRID_SANDBOX) {
            msg.mail_settings = { sandbox_mode: { enable: true } };
        }
        const p = new Promise((resolve, reject) => {
            const email = require('@sendgrid/mail');
            email.setApiKey(process.env.SENDGRID_API_KEY as string);
            email.send(msg, (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });

        });
        return p;
    }
}
