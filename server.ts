import express from "express";
import cors from 'cors';
import mongoose from 'mongoose';
import { UserModel } from "./database";
import bcrypt from 'bcryptjs';
import session from 'express-session';
import Cryptr from "cryptr";






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
    SESSION_NAME,
    CRYPT_SECRET
} = process.env;

//Encryption
const cryptr = new Cryptr(`${CRYPT_SECRET}`);



//connect to db
mongoose.connect(`${DB_URI}`);



//Middlewares

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000/');
    next();
  });


app.use(express.json());
app.use(cors({
    origin:"http://localhost:3000",
    credentials: true
}));

app.use(session({
    name: `${SESSION_NAME}`,
    secret: `${SESSION_SECRET}`,
    saveUninitialized: false,
    resave: false,
    cookie: {
        sameSite: false
    }
}));

function isAuthenticated(req:any, res:any, next:any) {
    if(!req.session.user) {
        console.log("Not authenticated");
        res.json("Not authenticated");
    }
    else{
        console.log("authenticated");
        next();
    } 
}



//requests
app.get('/', (req, res)=> {
    res.send("hello");

});


app.get('/data',isAuthenticated,async (req, res) => {
    

    const personId = req.query.id;
    console.log(personId);

    const info = await UserModel.findById({_id:personId});
    console.log(info);

    
    res.json(info);
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
            
            
            req.session.user = user._id;
          

            await req.session.save();

            console.log(req.session.user);

            res
            .status(202)
            .json(user._id); 
        }
        else {
            res.status(406).json('Password incorrect');
        }
        

    }
    else {
        res.status(400).json('No matches');
    }
});



app.get('/logout', isAuthenticated, (req, res) => {
    req.session.destroy(err => {if (err) console.log(err)});
    res.clearCookie(`${SESSION_NAME}`);
    res.json("cleared cookie").status(200);
})

app.post('/add', isAuthenticated, async (req, res) => {
    const {newAccount, newPass, userId} = req.body;
    console.log(newAccount);
    console.log(userId);
    try {
        const user = await UserModel.findById({_id:userId});
        user?.account.push({
            AccountName:newAccount,
            AccountPassword: cryptr.encrypt(newPass)
        });
        user?.save();
    }catch(err) {
        console.log(err);
    }

    res.json("All OK");
})





//port
app.listen(PORT, ():void => {
    console.log("Server listening on port 5000");
});

