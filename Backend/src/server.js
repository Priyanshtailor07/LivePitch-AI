import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
const app = express()
const server = http.createServer(app);
const port = process.env.PORT || 3000;

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});



io.use((socket, next) => {
  const token = socket.handshake.auth.token;    
    if (socket.userId==token) {
       
         next();
    }
    else {
        next(new Error("Authentication error: Missing Token"));
    }
   socket.userId = token;
  next();
});


io.on('connection', (socket) => {
   const userId=socket.userId;
   const userRoom=`room:${socket.userId}`;
   socket.join(userRoom);
   console.log(`User verified and locked into room: ${userRoom}`);

});



app.get('/', (req, res) => {
  res.send('Hello World!');
});
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});