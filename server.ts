import express from "express";
import cors from 'cors';
import mongoose from 'mongoose';
import { UserModel } from "./database";
import bcrypt from 'bcryptjs';


const dotenv = require('dotenv').config();
const app = express();



//connect to db
mongoose.connect(`${process.env.DB_URL}`);

//Middlewares
app.use(express.json());
app.use(cors());

//requests
app.get('/', (req, res)=> {
    res.send("hello");

});



app.post('/register', async (req, res) => {
    const {password, email} = req.body;

    const user = await UserModel.create({
        email,
        password: bcrypt.hashSync(password)
    });

    res.json({
        user
    });
})




//port
app.listen(5000, ():void => {
    console.log("Server listening on port 5000");
});

