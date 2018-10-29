"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthenticationService_1 = require("../services/AuthenticationService");
const router = express_1.Router();
router.get('/me', AuthenticationService_1.AuthenticationService.verifyToken, (req, res, next) => {
    res.send({ username: req.user.username, email: req.user.email, name: req.user.name });
});
router.post('/me', AuthenticationService_1.AuthenticationService.verifyToken, (req, res, next) => {
    const postedMe = req.body;
    req.user.name = req.body.name;
    if (postedMe.password) {
        if (postedMe.password !== postedMe.confirmPassword) {
            throw new Error('Passwords don\' match');
        }
        else {
            req.user.password = postedMe.password;
        }
    }
    req.user.save();
    res.send();
});
// Export the express.Router() instance to be used by server.ts
exports.UserController = router;
//# sourceMappingURL=user.controller.js.map