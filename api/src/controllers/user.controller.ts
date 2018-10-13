import { Request, Response, Router, NextFunction } from 'express';
import { IUser } from '../models/iuser';
import { User } from '../models/user';
import { AuthenticationService, IAuthenticatedRequest } from '../services/AuthenticationService';

const router: Router = Router();

interface IMe {
    name: string;
    username: string;
    email: string;
}

router.get('/me', AuthenticationService.verifyToken, (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
    res.send({ username: req.user.username, email: req.user.email, name: req.user.name } as IMe);
});

// Export the express.Router() instance to be used by server.ts
export const UserController: Router = router;
