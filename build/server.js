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
const dotenv = require('dotenv').config();
const app = (0, express_1.default)();
//env variables
const { DB_URI, SESSION_SECRET, PORT, SESSION_NAME } = process.env;
//connect to db
mongoose_1.default.connect(`${DB_URI}`);
//Middlewares
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000/');
    next();
});
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use((0, express_session_1.default)({
    name: `${SESSION_NAME}`,
    secret: `${SESSION_SECRET}`,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 10000000000000,
        sameSite: false
    }
}));
//requests
app.get('/', (req, res) => {
    res.send("hello");
});
app.get('/data', (req, res) => {
    console.log(req.session);
    if (!req.session.user)
        console.log("not ok");
    else
        console.log("authenticated");
    res.send("done");
});
app.post('/register', async (req, res) => {
    const { password, email } = req.body;
    const user = await database_1.UserModel.create({
        email,
        password: bcryptjs_1.default.hashSync(password)
    });
    res.json({
        user
    });
});
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await database_1.UserModel.findOne({ email });
    if (user) {
        const CorrectPass = bcryptjs_1.default.compareSync(password, user.password);
        if (CorrectPass) {
            req.session.user = user._id;
            await req.session.save();
            console.log(req.session.user);
            res
                .status(202)
                .json('Password OK');
        }
        else {
            res.status(406).json('Password incorrect');
        }
    }
    else {
        res.status(400).json('No matches');
    }
});
//port
app.listen(PORT, () => {
    console.log("Server listening on port 5000");
});
