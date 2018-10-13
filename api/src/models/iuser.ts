import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';

export interface IUser extends mongoose.Document {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;

  verifyPassword: (pwd: string, cb: (err: any, isMatch?: boolean) => void) => void;
}
