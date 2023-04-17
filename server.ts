import express from "express";
import cors from 'cors';
import mongoose from 'mongoose';
import { UserModel } from "./database";
import bcrypt from 'bcryptjs';
import session from 'express-session';



const dotenv = require('dotenv').config();
const app = express();


//TS
declare module "express-session" {
    interface SessionData {
      user: any;
    }
}




//env variables
const {
    DB_URI,
    SESSION_SECRET,
    PORT,
    SESSION_NAME
} = process.env;



//connect to db
mongoose.connect(`${DB_URI}`);



//Middlewares
app.use(express.json());
app.use(cors());

app.use(session({
    name: `${SESSION_NAME}`,
    secret: `${SESSION_SECRET}`,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 1,
        sameSite: true
    }
    

}))

function isAuthenticated(req: any, res: any, next: any) {
    if(!req.session.user) {
        res.json("Not authenticated")
    }
}



//requests
app.get('/', (req, res)=> {
    res.send("hello");

});


app.get('/data', isAuthenticated, (req, res) => {
    res.json("You are authenticated");
})

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
        if(CorrectPass){ 
            

            //store session
            req.session.user = user._id;

            res
            .status(202)
            .json('Password OK') 
        }
        else {
            res.status(406).json('Password incorrect');
        }
        

    }
    else {
        res.status(400).json('No matches');
    }
})




//port
app.listen(PORT, ():void => {
    console.log("Server listening on port 5000");
});

