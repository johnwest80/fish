import { Request, Response, Router, NextFunction } from 'express';
import { IUser } from '../models/iuser';
import { User } from '../models/UserSchema';
import { AuthenticationService } from '../services/AuthenticationService';
import { ISecurityLoginPost, ISecurityRegisterPost, IPostResult } from './api';
import { Location } from '../models/LocationSchema';
import { ILocation } from '../models/ILocation';
import { ObjectID } from 'bson';

const router: Router = Router();

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  const model = req.body as ISecurityLoginPost;

  return AuthenticationService.login(req, res, model.username, model.password);
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  const model = req.body as ISecurityRegisterPost;
  const response = {} as IPostResult;

  const user = new User({
    _id: new ObjectID(),
    username: model.username,
    password: model.password,
    name: model.name,
    email: model.email,
    verified: false
  } as IUser);

  if (model.location) {
    const location = new Location({
      _id: new ObjectID(),
      name: model.location.locationName,
      timezone: model.location.timezone,
      zipCode: model.location.zipCode,
      devices: {},
      users: {}
    } as ILocation);
    await location.save();
  }

  user.save((err) => {
    response.systemError = { text: 'There was an unexpected error registering.  Please try again.' };
    res.send(response);
  });
});

// Export the express.Router() instance to be used by server.ts
export const SecurityController: Router = router;
