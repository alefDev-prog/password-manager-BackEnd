import { Request, Response, NextFunction } from 'express';

export default function isAuthenticated(req:Request, res:Response, next:NextFunction) {
    console.log(req.session);
    if(!req.session.user) {
        res.json("Not authenticated");
    }
    else{
        console.log("authenticated");
        next();
    } 
}


