import { Response, Request, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { secret } from '../../config/database';
import { IUser } from '../models/iuser';
import { User } from '../models/UserSchema';
import { AuditLogService } from '../services/AuditLogService';
import { Severity } from '../models/Severity';
import { AuditLogEntryType } from '../models/AuditLogEntryType';

export interface IAuthenticatedRequest extends Request {
    user: IUser;
}

const tokenSecret = process.env.secret || secret;

export class AuthenticationService {
    public static verifyToken(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
        const token = req.headers['authorization'] as string;
        if (!token) {
            return res.status(403).send({ auth: false, message: 'No token provided.' });
        }
        jwt.verify(token.replace('Bearer ', ''), tokenSecret, (err, decoded: any) => {
            if (err) {
                return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });
            }
            // if everything good, save to request for use in other routes
            User.findOne({ _id: decoded.id }, (findErr: any, user: IUser) => {
                if (findErr) {
                    return res.status(401).send('User information not found.');
                }
                req.user = user;
                next();
            });
        });
    }

    public static login(req: Request, res: Response, username: string, password: string) {
        User.findOne({ username }, (err: any, user: IUser) => {
            if (err) {
                res.status(500).send('Error on the server.');
            } else if (!user) {
                AuditLogService.createEntryForSystem("Error", "Login", `No user found with username ${username}`);
                res.status(404).send('No user found.');
            } else {
                user.verifyPassword(req.body.password, (verifyErr) => {
                    if (verifyErr) {
                        AuditLogService.createEntryForSystem("Error", "Login",
                            `Username or password incorrect for username ${username}`);
                        res.status(401).send('Username or password incorrect.');
                    } else {
                        const token = jwt.sign({ id: user._id }, tokenSecret, {
                            expiresIn: 86400 * 7 // expires in 7 days
                        });
                        AuditLogService.createEntryForUser(user._id, "Success", "Login", `${username}`);
                        res.status(200).send({ accessToken: token, roles: [user.role || 'USER'], refreshToken: 'none' });
                    }
                });
            }
        });
    }
}
