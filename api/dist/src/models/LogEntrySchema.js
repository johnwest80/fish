"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const LogEntrySchema = new mongoose_1.Schema({
    _id: {
        d: { type: Date, required: true },
        n: { type: String, required: true }
    },
    i: { type: Number, required: true },
    o: { type: Number, required: true },
    t: { type: Number, required: true },
    w: { type: Number },
    start: { type: Boolean },
    end: { type: Boolean },
    startUnsure: { type: Boolean },
    endUnsure: { type: Boolean },
});
exports.LogEntry = mongoose_1.model('LogEntry', LogEntrySchema);
//# sourceMappingURL=LogEntrySchema.js.map