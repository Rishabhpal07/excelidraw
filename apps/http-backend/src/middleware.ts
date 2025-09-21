import { NextFunction,Request,Response } from "express";
import jwt  from "jsonwebtoken";
import {JWT_SECRET} from "@repo/backend-common/config";

export function middleware(req:Request,res:Response,next:NextFunction){
    const token=req.headers["authorization"]??"";
    //@ts-ignore
    const decode=jwt.verify(token,JWT_SECRET);
    if(decode){
        //@ts-ignore
      req.userId=decode.userId;
      next();
    }
    else{
        res.status(304).json({message:"unorthorized"})
    }

}