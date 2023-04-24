import express from "express";
import cors from 'cors';
import mongoose from 'mongoose';
import { UserModel } from "./database";
import bcrypt from 'bcryptjs';
import session from 'express-session';
import Cryptr from "cryptr";
//import { findAccount } from "./utils/utils";






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
    const {password, username} = req.body;

    const user = await UserModel.create({
        username,
        password: bcrypt.hashSync(password)
    });

    res.json({
        user
    });
})


app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const user = await UserModel.findOne({username});

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
            AccountPassword: cryptr.encrypt(newPass),
            _id: new mongoose.Types.ObjectId()
        });
        user?.save();
    }catch(err) {
        console.log(err);
    }

    res.json("All OK");
});



app.post('/getpass', isAuthenticated, async (req, res) => {
    const {userId, accountId} = req.body;
    console.log(userId);
    console.log(accountId);
    let password: string | undefined;

    try {
        const user = await UserModel.findById({
            _id:userId,
            account: {_id: accountId}
        })
        const accounts = user?.account;
        
        if(accounts != null && accounts != undefined){
            const response = accounts.filter(a => a._id == accountId);

           if(response[0].AccountPassword !== undefined) password = cryptr.decrypt(response[0].AccountPassword);
        }


        


        
    } catch(err) {
        console.log(err);
    }

    if(password) res.json(password);
    else res.status(400);
});


app.delete('/delete', isAuthenticated, async(req, res) => {
    const {userId, accountId} = req.body;
    try {
        await UserModel.findOneAndUpdate({_id:userId}, {$pull: {account: {_id: accountId}}});
    } catch(err) {
        console.log(err);
        res.json("Not OK").status(400);
        return;
    }
    

    res.json("All OK").status(200);
})





//port
app.listen(PORT, ():void => {
    console.log("Server listening on port 5000");
});

