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
const UserSchema_1 = require("../models/UserSchema");
const AuthenticationService_1 = require("../services/AuthenticationService");
const LocationSchema_1 = require("../models/LocationSchema");
const bson_1 = require("bson");
const router = express_1.Router();
router.post('/login', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const model = req.body;
    return AuthenticationService_1.AuthenticationService.login(req, res, model.username, model.password);
}));
router.post('/register', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const model = req.body;
    const response = {};
    const user = new UserSchema_1.User({
        _id: new bson_1.ObjectID(),
        username: model.username,
        password: model.password,
        name: model.name,
        email: model.email,
        verified: false
    });
    if (model.location) {
        const location = new LocationSchema_1.Location({
            _id: new bson_1.ObjectID(),
            name: model.location.locationName,
            timezone: model.location.timezone,
            zipCode: model.location.zipCode,
            devices: {},
            users: {}
        });
        yield location.save();
    }
    user.save((err) => {
        response.systemError = { text: 'There was an unexpected error registering.  Please try again.' };
        res.send(response);
    });
}));
// Export the express.Router() instance to be used by server.ts
exports.SecurityController = router;
//# sourceMappingURL=security.controller.js.map