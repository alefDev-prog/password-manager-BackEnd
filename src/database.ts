import mongoose from "mongoose";


const {Schema} = mongoose;

const UserSchema = new Schema({
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
});


export const UserModel = mongoose.model('User', UserSchema);

