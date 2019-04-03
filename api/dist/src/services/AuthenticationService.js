"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = __importStar(require("jsonwebtoken"));
const database_1 = require("../../config/database");
const UserSchema_1 = require("../models/UserSchema");
const AuditLogService_1 = require("../services/AuditLogService");
const tokenSecret = process.env.secret || database_1.secret;
class AuthenticationService {
    static verifyToken(req, res, next) {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(403).send({ auth: false, message: 'No token provided.' });
        }
        jwt.verify(token.replace('Bearer ', ''), tokenSecret, (err, decoded) => {
            if (err) {
                return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });
            }
            // if everything good, save to request for use in other routes
            UserSchema_1.User.findOne({ _id: decoded.id }, (findErr, user) => {
                if (findErr) {
                    return res.status(401).send('User information not found.');
                }
                req.user = user;
                next();
            });
        });
    }
    static login(req, res, username, password) {
        UserSchema_1.User.findOne({ username }, (err, user) => {
            if (err) {
                res.status(500).send('Error on the server.');
            }
            else if (!user) {
                AuditLogService_1.AuditLogService.createEntryForSystem("Error", "Login", `No user found with username ${username}`);
                res.status(404).send('No user found.');
            }
            else {
                user.verifyPassword(req.body.password, (verifyErr) => {
                    if (verifyErr) {
                        AuditLogService_1.AuditLogService.createEntryForSystem("Error", "Login", `Username or password incorrect for username ${username}`);
                        res.status(401).send('Username or password incorrect.');
                    }
                    else {
                        const token = jwt.sign({ id: user._id }, tokenSecret, {
                            expiresIn: 86400 * 7 // expires in 7 days
                        });
                        AuditLogService_1.AuditLogService.createEntryForUser(user._id, "Success", "Login", `${username}`);
                        res.status(200).send({ accessToken: token, roles: [user.role || 'USER'], refreshToken: 'none' });
                    }
                });
            }
        });
    }
}
exports.AuthenticationService = AuthenticationService;
//# sourceMappingURL=AuthenticationService.js.map