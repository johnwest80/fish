"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserSchema_1 = require("../models/UserSchema");
// Assign router to the express.Router() instance
const router = express_1.Router();
// The / here corresponds to the route that the WelcomeController
// is mounted on in the server.ts file.
// In this case it's /welcome
router.get('/', (req, res) => {
    // Reply with a hello world when no name param is provided
    res.send('Hello, World!');
});
router.get('/getall', (req, res) => {
    UserSchema_1.User.find().then((users) => {
        res.send(users);
    });
});
router.get('/getone', (req, res) => {
    UserSchema_1.User.find().then((users) => {
        return users[3].verifyPassword('abcde', (err, isMatch) => {
            res.send({ pwd: users[0].password, err, isMatch });
        });
    });
});
// Export the express.Router() instance to be used by server.ts
exports.WelcomeController = router;
//# sourceMappingURL=welcome.controller.js.map