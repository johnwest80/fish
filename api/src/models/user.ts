import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  salt: String
});

export const User = mongoose.model('User', UserSchema);
