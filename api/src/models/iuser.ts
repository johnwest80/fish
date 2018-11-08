import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';

export interface IUser extends mongoose.Document {
  _id: ObjectId;
  name: string;
  username: string;
  email: string;
  password: string;
  verified: boolean;

  verifyPassword: (pwd: string, cb: (err: any, isMatch?: boolean) => void) => void;
}
