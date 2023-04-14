"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
//Middlewares
app.use(express_1.default.json());
app.use((0, cors_1.default)());
//requests
app.get('/', (req, res) => {
    res.send("default message");
});
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    console.log(req.body);
    res.json({
        username,
        password
    });
});
//port
app.listen(5000, () => {
    console.log("Server listening on port 5000");
});
