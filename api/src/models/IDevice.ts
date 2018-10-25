import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';

export interface IDevice extends mongoose.Document {
  _id: ObjectId;
  name: string;
  minHeatRise: number;
  maxHeatRise: number;
  id: string;
}
