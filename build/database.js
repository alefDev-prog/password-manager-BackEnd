"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const UserSchema = new Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    account: [{
            AccountName: String,
            AccountPassword: String,
            _id: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                required: true,
                auto: true,
            }
        }]
});
exports.UserModel = mongoose_1.default.model('User', UserSchema);
