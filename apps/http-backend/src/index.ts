import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config";
import {CreateUserSchema, SigninSchema,CreateRoomSchema} from "@repo/common/types";
import {prismaClient} from "@repo/db/client";
import { middleware } from "./middleware";
const app=express();
app.use(express.json())


app.post("/signup", async (req, res) => {
  
    const parseData = CreateUserSchema.safeParse(req.body);
    if (!parseData.success) {
      return res.status(400).json({
        message: "incorrect input data",
      });
    }
  
    try {
      const user = await prismaClient.user.create({
        data: {
          email: parseData.data.username,
          //todo:hash the password
          password: parseData.data.password,
          name: parseData.data.name,
        },
      });
  
      //const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  
      return res.status(201).json({
        userId:user.id
      });
    } catch (error) {
      console.error(error);
      return res.status(409).json({
        message: "user already exists with this username",
      });
    }
  });
  

app.post("/signin",async(req,res)=>{
 const parseData=SigninSchema.safeParse(req.body);
 if(!parseData){
    res.json({
        message:"incorrect inputs"
    })
    return 
 }

 //todo:compare the password
 const user =await prismaClient.user.findFirst({
    where:{
        email:parseData.data?.username,
        password:parseData.data?.password
    }
 })

 if(!user){
    res.status(401).json({
        message:"not authenicated"
    })
    return
 }

 const token=jwt.sign({
    userId:user?.id
 },JWT_SECRET)

 res.json({
    token
 })

})

app.post("/room",middleware,async(req,res)=>{
    const parseData = CreateRoomSchema.safeParse(req.body);
    if (!parseData.success) {
      return res.status(400).json({
        message: "incorrect input data",
      });
    } 
     //@ts-ignore
    const userId=req.userId;
    try {
        const room= await prismaClient.room.create({
            data:{
              slug:parseData.data.name,
              adminId:userId
            }
          })
      
          res.status(200).json({
              roomId:room.id
          }) 
    } catch (error) {
       res.status(411).json({
        message:"room already exists"
       })
    }

})

app.get("/chats/:roomId",async (req,res)=>{
  const roomId=Number(req.params.roomId);
  const message=await prismaClient.chat.findMany({
    where:{
      roomId:roomId
    },
    orderBy:{
      id:"desc"
    },
    take:50
  })
  res.json({
    message
  })
})

app.listen(3001);