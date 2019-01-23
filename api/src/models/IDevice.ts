import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';
import { IDeviceImage } from './IDeviceImage';

export interface IDevice extends mongoose.Document {
  name: string;
  minHeatRise: number;
  maxHeatRise: number;
  id: string;
  particleId: string;
  disabled: boolean;
  reversed: boolean;
  filterSize: string;
  images: IDeviceImage[];
  baseline: {
    heat: number;
    cool: number;
    tolerancePercent: number;
  };
}
