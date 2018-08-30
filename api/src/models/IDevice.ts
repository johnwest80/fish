import * as mongoose from 'mongoose';

export interface IDevice extends mongoose.Document {
  name: string;
  id: string;
}
