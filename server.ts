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


app.post('/login', async (req, res) => {
    const {email, password} = req.body;
    const user = await UserModel.findOne({email});
    if(user) {
        const CorrectPass: boolean = bcrypt.compareSync(password, user.password);
        CorrectPass ? 
        res.status(202).json('Password OK') 
        :
        res.status(406).json('Password incorrect');

    }
    else {
        res.status(400).json('No matches');
    }
})




//port
app.listen(process.env.PORT, ():void => {
    console.log("Server listening on port 5000");
});

