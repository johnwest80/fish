import { Schema, model } from 'mongoose';
import { ICalendarMinute } from './ICalendarMinute';

const CalendarMinuteSchema = new Schema({
    _id: { type: Date, required: true }
});

export const CalendarMinute = model<ICalendarMinute>('calendarminutes', CalendarMinuteSchema);
