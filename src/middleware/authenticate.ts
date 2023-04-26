import { Request, Response, NextFunction } from 'express';

export default function isAuthenticated(req:Request, res:Response, next:NextFunction) {
    if(!req.session.user) {
        res.json("Not authenticated");
    }
    else{
        console.log("authenticated");
        next();
    } 
}


