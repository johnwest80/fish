"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcrypt = require("bcrypt");
const UserSchema = new mongoose_1.Schema({
    _id: mongoose_1.Schema.Types.ObjectId,
    username: { type: String, required: true, unique: true },
    name: String,
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    location: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Location' }
});
UserSchema.pre('save', function (callback) {
    const user = this;
    // Break out if the password hasn't changed
    if (!user.isModified('password')) {
        return callback();
    }
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
UserSchema.methods.verifyPassword = function (password, cb) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
        if (err) {
            return cb(err);
        }
        else if (!isMatch) {
            return cb('Incorrect username or password');
        }
        else {
            return cb(null, true);
        }
    });
};
exports.User = mongoose_1.model('User', UserSchema);
//# sourceMappingURL=UserSchema.js.map