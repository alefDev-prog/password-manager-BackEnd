"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("./database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv = require('dotenv').config();
const app = (0, express_1.default)();
//connect to db
mongoose_1.default.connect(`${process.env.DB_URL}`);
//Middlewares
app.use(express_1.default.json());
app.use((0, cors_1.default)());
//requests
app.get('/', (req, res) => {
    res.send("hello");
});
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, email } = req.body;
    const user = yield database_1.UserModel.create({
        email,
        password: bcryptjs_1.default.hashSync(password)
    });
    res.json({
        user
    });
}));
//port
app.listen(5000, () => {
    console.log("Server listening on port 5000");
});
