import mongoose from "mongoose";


const {Schema} = mongoose;

const UserSchema = new Schema({
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    account: [{
        AccountName: String,
        AccountPassword: String,
        _id: String
    }]
});


export const UserModel = mongoose.model('User', UserSchema);

