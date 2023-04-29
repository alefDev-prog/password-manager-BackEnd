import express from "express";
import cors from 'cors';
import mongoose from 'mongoose';
import { UserModel } from "./database";
import bcrypt from 'bcryptjs';
import session from 'express-session';
import Cryptr from "cryptr";
import { UserInDb } from "./TS/interfaces";
import isAuthenticated from "./middleware/authenticate";
const MongoDBStore = require('connect-mongodb-session')(session);
const jwt = require('jsonwebtoken')







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
    PORT,
    CRYPT_SECRET,
    PASS_SESSION_URI,
    FRONTEND_URL,
    ACCESS_TOKEN_SECRET,
    ACCESS_REFRESH_TOKEN_SECRET
} = process.env;

//Encryption
const cryptr = new Cryptr(`${CRYPT_SECRET}`);



//connect to db
try {
    mongoose.connect(`${DB_URI}`);
} catch(err) {
    console.log(err);
}





//Middlewares

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', `${FRONTEND_URL}`);
    next();
  });


app.use(express.json());


app.use(cors({
    origin:`${FRONTEND_URL}`,
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
app.get('/', (req, res)=> {
    res.send("hello");

});


app.get('/data', isAuthenticated, async (req, res) => {
    
    
    const personId = req.query.id;

    const info: UserInDb | null = await UserModel.findById({_id:personId});

    
    res.json(info);
})


app.post('/register', async (req, res, next) => {
    const {password, username} = req.body;

    const checkUser: UserInDb | null  = await UserModel.findOne({username});
   

    if(checkUser != null) res.status(409).json("Username already taken");  
    else {
        try {
            const user = await UserModel.create({
                username,
                password: bcrypt.hashSync(password)
            });

            const accesstoken = jwt.sign(user.toJSON(), ACCESS_TOKEN_SECRET, {expiresIn: 900})
            const id = user._id

            res
            .status(202)
            .json({
                id,
                accesstoken
            }); 
            
        } catch(e) {
            console.log(e);
            res.json("Failed");
        }
    
    }

    
    
})


app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const user  = await UserModel.findOne({username});

   

    if(user) {
        const CorrectPass: boolean = bcrypt.compareSync(password, user.password);
        if(CorrectPass){ 
            
            
          
          
            const accesstoken = jwt.sign(user.toJSON(), ACCESS_TOKEN_SECRET)
            const id = user._id

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



app.get('/logout', isAuthenticated, (req, res) => {
    
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





//server
app.listen(PORT, ():void => {
    console.log(`Server listening on port ${PORT}`);
});

