import mongoose from "mongoose"

export interface UserInDb {
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    account: [{
        AccountName: String,
        AccountPassword: String,
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            auto: true,
        }
    }]
}