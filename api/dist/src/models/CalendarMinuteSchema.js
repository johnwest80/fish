"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CalendarMinuteSchema = new mongoose_1.Schema({
    _id: { type: Date, required: true }
});
exports.CalendarMinute = mongoose_1.model('calendarminutes', CalendarMinuteSchema);
//# sourceMappingURL=CalendarMinuteSchema.js.map