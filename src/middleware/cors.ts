import { Request, Response, NextFunction } from 'express';

export default function corsMiddle(req: Request, res: Response, next: NextFunction)  {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000/');
    next();
  }