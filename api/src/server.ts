import express from 'express';
import mongoose from 'mongoose';
import { database } from '../config/database';

// Import WelcomeController from controllers entry point
import { WelcomeController } from './controllers';

mongoose.connect(database);
const db = mongoose.connection;
db.once('open', () => {
  // Create a new express application instance
  const app: express.Application = express();
  // The port the express app will listen on
  const port: number = (process.env.PORT || 3000) as number;

  // Mount the WelcomeController at the /welcome route
  app.use('/welcome', WelcomeController);

  // Serve the application at the given port
  app.listen(port, () => {
    // Success callback
    console.log(`Listening at http://localhost:${port}/`);
  });
});
