import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';

export interface IDevice extends mongoose.Document {
  name: string;
  minHeatRise: number;
  maxHeatRise: number;
  id: string;
  particleId: string;
  disabled: boolean;
  reversed: boolean;
}
