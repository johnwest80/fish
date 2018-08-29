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
const user_1 = require("../models/user");
const AuthenticationService_1 = require("../services/AuthenticationService");
const router = express_1.Router();
router.post('/login', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    return AuthenticationService_1.AuthenticationService.login(req, res, req.body.username, req.body.password);
}));
router.post('/register', (req, res, next) => {
    const user = new user_1.User({ username: req.body.username, password: req.body.password });
    user.save((err) => {
        res.send(err);
    });
});
router.get('/me', AuthenticationService_1.AuthenticationService.verifyToken, (req, res, next) => {
    res.send(req.user);
});
// Export the express.Router() instance to be used by server.ts
exports.SecurityController = router;
//# sourceMappingURL=security.controller.js.map