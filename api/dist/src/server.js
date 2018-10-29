"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const database_1 = require("../config/database");
const morgan = require("morgan");
// Import WelcomeController from controllers entry point
const controllers_1 = require("./controllers");
const security_controller_1 = require("./controllers/security.controller");
const hvac_controller_1 = require("./controllers/hvac.controller");
const user_controller_1 = require("./controllers/user.controller");
mongoose.connect(process.env.database || database_1.database, { user: process.env.dbUsername || database_1.dbUsername, pass: process.env.dbPassword || database_1.dbPassword, dbName: process.env.dbName || database_1.dbName });
const db = mongoose.connection;
db.once('open', () => {
    // Create a new express application instance
    const app = express();
    // The port the express app will listen on
    const port = (process.env.PORT || 3000);
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
        next();
    });
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    // Mount the WelcomeController at the /welcome route
    app.use('/welcome', controllers_1.WelcomeController);
    app.use('/security', security_controller_1.SecurityController);
    app.use('/hvac', hvac_controller_1.HvacController);
    app.use('/user', user_controller_1.UserController);
    app.use((error, req, res, next) => {
        if (error && error.message) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error });
        }
    });
    // use morgan to log requests to the console
    app.use(morgan('dev'));
    // Serve the application at the given port
    app.listen(port, () => {
        // Success callback
        // tslint:disable-next-line:no-console
        console.log(`Listening at http://localhost:${port}/`);
    });
});
//# sourceMappingURL=server.js.map