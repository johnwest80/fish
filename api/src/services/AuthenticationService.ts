import { Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { secret } from '../../config/database';
import { IUser } from '../models/iuser';
import bcrypt from 'bcrypt';
import { User } from '../models/user';

export class AuthenticationService {
    public static verifyToken(req: Request, res: Response, next: NextFunction) {
        const token = req.headers['x-access-token'] as string;
        if (!token) {
            return res.status(403).send({ auth: false, message: 'No token provided.' });
        }
        jwt.verify(token, secret, (err, decoded: any) => {
            if (err) {
                return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            }
            // if everything good, save to request for use in other routes
            User.findOne({ _id: decoded.id }, (findErr: any, user: IUser) => {
                if (findErr) {
                    return res.status(401).send('User information not found.');
                }
                (req as any).user = user;
                next();
            });
        });
    }

    public static login(req: Request, res: Response, username: string, password: string) {
        User.findOne({ username }, (err: any, user: IUser) => {
            if (err) {
                res.status(500).send('Error on the server.');
            }
            if (!user) {
                res.status(404).send('No user found.');
            }

            user.verifyPassword(req.body.password, (verifyErr) => {
                if (verifyErr) {
                     res.status(401).send('Username or password incorrect.');
                }
            });

            const token = jwt.sign({ id: user._id }, secret, {
                expiresIn: 86400 // expires in 24 hours
            });
            res.status(200).send({ auth: true, token });
        });
    }
}
