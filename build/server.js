"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("./database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_session_1 = __importDefault(require("express-session"));
const cryptr_1 = __importDefault(require("cryptr"));
const authenticate_1 = __importDefault(require("./middleware/authenticate"));
const MongoDBStore = require('connect-mongodb-session')(express_session_1.default);
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const app = (0, express_1.default)();
//env variables
const { DB_URI, PORT, CRYPT_SECRET, PASS_SESSION_URI, FRONTEND_URL, ACCESS_TOKEN_SECRET, ACCESS_REFRESH_TOKEN_SECRET } = process.env;
//Encryption
const cryptr = new cryptr_1.default(`${CRYPT_SECRET}`);
//connect to db
try {
    mongoose_1.default.connect(`${DB_URI}`);
}
catch (err) {
    console.log(err);
}
//Middlewares
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', `${FRONTEND_URL}`);
    next();
});
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: `${FRONTEND_URL}`,
    credentials: true
}));
app.options('*', (req, res) => {
    res.set('Access-Control-Allow-Origin', `${FRONTEND_URL}`);
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.status(200).send();
});
//requests
app.get('/', (req, res) => {
    res.send("hello");
});
app.get('/data', authenticate_1.default, async (req, res) => {
    const personId = req.query.id;
    const info = await database_1.UserModel.findById({ _id: personId });
    res.json(info);
});
app.post('/register', async (req, res, next) => {
    const { password, username } = req.body;
    const checkUser = await database_1.UserModel.findOne({ username });
    if (checkUser != null)
        res.status(409).json("Username already taken");
    else {
        try {
            const user = await database_1.UserModel.create({
                username,
                password: bcryptjs_1.default.hashSync(password)
            });
            req.session.user = user._id;
            await req.session.save();
            res.status(200).json(user._id);
            next();
        }
        catch (e) {
            console.log(e);
            res.json("Failed");
        }
    }
});
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await database_1.UserModel.findOne({ username });
    if (user) {
        const CorrectPass = bcryptjs_1.default.compareSync(password, user.password);
        if (CorrectPass) {
            const accesstoken = jwt.sign(user.toJSON(), ACCESS_TOKEN_SECRET);
            const id = user._id;
            res
                .status(202)
                .json({
                id,
                accesstoken
            });
        }
        else {
            res.status(406).json('Password incorrect');
        }
    }
    else {
        res.status(400).json('No matches');
    }
});
app.get('/logout', authenticate_1.default, (req, res) => {
});
app.post('/add', authenticate_1.default, async (req, res) => {
    const { newAccount, newPass, userId } = req.body;
    console.log(newAccount);
    console.log(userId);
    try {
        const user = await database_1.UserModel.findById({ _id: userId });
        user === null || user === void 0 ? void 0 : user.account.push({
            AccountName: newAccount,
            AccountPassword: cryptr.encrypt(newPass),
            _id: new mongoose_1.default.Types.ObjectId()
        });
        user === null || user === void 0 ? void 0 : user.save();
    }
    catch (err) {
        console.log(err);
    }
    res.json("All OK");
});
app.post('/getpass', authenticate_1.default, async (req, res) => {
    const { userId, accountId } = req.body;
    console.log(userId);
    console.log(accountId);
    let password;
    try {
        const user = await database_1.UserModel.findById({
            _id: userId,
            account: { _id: accountId }
        });
        const accounts = user === null || user === void 0 ? void 0 : user.account;
        if (accounts != null && accounts != undefined) {
            const response = accounts.filter(a => a._id == accountId);
            if (response[0].AccountPassword !== undefined)
                password = cryptr.decrypt(response[0].AccountPassword);
        }
    }
    catch (err) {
        console.log(err);
    }
    if (password)
        res.json(password);
    else
        res.status(400);
});
app.delete('/delete', authenticate_1.default, async (req, res) => {
    const { userId, accountId } = req.body;
    try {
        await database_1.UserModel.findOneAndUpdate({ _id: userId }, { $pull: { account: { _id: accountId } } });
    }
    catch (err) {
        console.log(err);
        res.json("Not OK").status(400);
        return;
    }
    res.json("All OK").status(200);
});
//server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
