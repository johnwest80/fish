import { Request, Response, Router, NextFunction } from 'express';
import { IUser } from '../models/iuser';
import { User } from '../models/user';
import { AuthenticationService } from '../services/AuthenticationService';

const router: Router = Router();

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  return AuthenticationService.login(req, res, req.body.username, req.body.password);
});

router.post('/register', (req: Request, res: Response, next: NextFunction) => {
  const user = new User({ username: req.body.username, password: req.body.password } as IUser);
  user.save((err) => {
    res.send(err);
  });
});

router.get('/me', AuthenticationService.verifyToken, (req: Request, res: Response, next: NextFunction) => {
  res.send((req as any).user);
});

// Export the express.Router() instance to be used by server.ts
export const SecurityController: Router = router;
