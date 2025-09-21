import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config";
//@ts-ignore
import CreateUserSchema from "@repo/common/types";

const app=express();

app.post("signin",(req,res)=>{

    const data=CreateUserSchema.safeParse(req.body);
    if(!data.success){
        res.json({
            message:"incorrect data"
        })
    }
    


})

app.post("signup",(req,res)=>{

    const userId=1;
    const token=jwt.sign({
        userId
        //@ts-ignore
    },JWT_SECRET)

    res.json(token)
    
})

app.post("room",(req,res)=>{
    
})



app.listen(3001);