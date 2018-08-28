import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from './iuser';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: String,
  password: { type: String, required: true, unique: true }
});

UserSchema.pre('save', function(this: IUser, callback) {
  const user = this;

  // Break out if the password hasn't changed
  if (!user.isModified('password')) { return callback(); }

  // Password changed so we need to hash it
  // tslint:disable-next-line:only-arrow-functions
  bcrypt.genSalt(5, function(err, salt) {
    if (err) {
      return callback(err);
    }

    // tslint:disable-next-line:only-arrow-functions
    bcrypt.hash(user.password, salt, function(errr, hash) {
      if (errr) {
        return callback(errr);
      }
      user.password = hash;
      callback();
    });
  });
});

UserSchema.methods.verifyPassword = function(password: string, cb: (err: any, isMatch?: boolean) => void) {
  bcrypt.compare(password, this.password, (err: any, isMatch: boolean) => {
    if (err) {
      return cb(err);
    } else if (!isMatch) {
      return cb('Incorrect username or password');
    } else {
      return cb(null, true);
    }
  });
};

export const User = mongoose.model<IUser>('User', UserSchema);
