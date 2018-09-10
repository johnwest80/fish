import bodyParser = require('body-parser');
import express = require('express');
import  mongoose = require('mongoose');
import { database, dbUsername, dbPassword, dbName } from '../config/database';
import morgan = require('morgan');

// Import WelcomeController from controllers entry point
import { WelcomeController } from './controllers';
import { SecurityController } from './controllers/security.controller';
import { HvacController } from './controllers/hvac.controller';

mongoose.connect(process.env.database || database,
  { user: process.env.dbUsername || dbUsername, pass: process.env.dbPassword || dbPassword, dbName: process.env.dbName || dbName });
const db = mongoose.connection;
db.once('open', () => {
  // Create a new express application instance
  const app: express.Application = express();
  // The port the express app will listen on
  const port: number = (process.env.PORT || 3000) as number;

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  });

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // Mount the WelcomeController at the /welcome route
  app.use('/welcome', WelcomeController);
  app.use('/security', SecurityController);
  app.use('/hvac', HvacController);

  app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (error && error.message) {
      res.status(500).json({ error: error.message });
    } else {
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
