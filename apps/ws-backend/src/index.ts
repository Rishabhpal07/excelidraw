import {  WebSocketServer} from "ws";

import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8081 })

interface User{
    ws:WebSocket,
    rooms:string[],
    userId:string
}

const users:User[]=[];

function checkUser(token:string):string|null{

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded == "string") {
            return null;
        }
        if (!decoded || !decoded.userId) {
            return null;
        }
        return decoded.userId;  
    } catch (error) {
      return null  
    }
}

wss.on('connection', function connection(ws, request) {
    const url = request.url;

    if (!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    const userId=checkUser(token);
    if(!userId){
        ws.close()
        return null
    }

    users.push({
        userId,
        rooms:[],
        //@ts-ignore
        ws
    })

    ws.on('message',async function message(data){
        const parseData=JSON.parse(data as unknown as string);

       if(parseData.type==='join_room'){
        //@ts-ignore
        const user=users.find(x => x.ws === ws);
        user?.rooms.push(parseData.roomId)
       }
       if(parseData.type==='leave_room'){
        //@ts-ignore
        const user=users.find(x=>x.ws===ws);
        if(!user){
            return
        }
        user.rooms=user?.rooms.filter(x=>x===parseData.room)
       }

       if(parseData.type==='chat'){
        const roomId=parseData.roomId
        const message=parseData.message;

        await prismaClient.chat.create({
            data:{
                roomId,
                message,
                userId
            }
        })
        
        users.forEach(user=>{
            if(user.rooms.includes(roomId)){
                user.ws.send(JSON.stringify({
                    type:'chat',
                    message:message,
                    roomId
                }))
            }
        })

       }
    })
})