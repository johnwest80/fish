import { Schema, model } from 'mongoose';
import bcrypt = require('bcrypt');
import { IUser } from './iuser';

const UserSchema = new Schema({
  _id: Schema.Types.ObjectId,
  username: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  location: { type: Schema.Types.ObjectId, ref: 'locations' }
});

UserSchema.pre('save', function (this: IUser, callback) {
  const user = this;

  // Break out if the password hasn't changed
  if (!user.isModified('password')) { return callback(); }

  // Password changed so we need to hash it
  // tslint:disable-next-line:only-arrow-functions
  bcrypt.genSalt(5, function (err, salt) {
    if (err) {
      return callback(err);
    }

    // tslint:disable-next-line:only-arrow-functions
    bcrypt.hash(user.password, salt, function (errr, hash) {
      if (errr) {
        return callback(errr);
      }
      user.password = hash;
      callback();
    });
  });
});

UserSchema.methods.verifyPassword = function (password: string, cb: (err: any, isMatch?: boolean) => void) {
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

export const User = model<IUser>('User', UserSchema);
