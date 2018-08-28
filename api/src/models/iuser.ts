import * as mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;

  verifyPassword: (pwd: string, cb: (err: any, isMatch?: boolean) => void) => void;
}
