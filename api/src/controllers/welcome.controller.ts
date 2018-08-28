import { Request, Response, Router } from 'express';
import { IUser } from '../models/iuser';
import { User } from '../models/user';

// Assign router to the express.Router() instance
const router: Router = Router();

// The / here corresponds to the route that the WelcomeController
// is mounted on in the server.ts file.
// In this case it's /welcome
router.get('/', (req: Request, res: Response) => {
  // Reply with a hello world when no name param is provided
  res.send('Hello, World!');
});

router.get('/getall', (req: Request, res: Response) => {
  User.find().then((users) => {
    res.send(users);
  });
});

router.get('/getone', (req: Request, res: Response) => {
  User.find().then((users) => {
    return users[3].verifyPassword('abcde', (err, isMatch) => {
      res.send({ pwd: users[0].password, err, isMatch });
    });
  });
});

// Export the express.Router() instance to be used by server.ts
export const WelcomeController: Router = router;
