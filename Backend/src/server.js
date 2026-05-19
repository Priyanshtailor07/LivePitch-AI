import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';


const app = express()

app.use(cors({origin:'http://localhost:5173'
}));
app.use(express.json());
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

  if (!token) {
    console.log("❌ Gatekeeper: No token found. Slamming the door!");
    // CRITICAL: You must return next(error) so execution STOPS here
    return next(new Error("Authentication error: Missing Token"));
  }

  socket.userId = token;
  next();
})


io.on('connection', (socket) => {
   const userId=socket.userId;
   const userRoom=`room:${userId}`;
   socket.join(userRoom);
   console.log(`User verified and locked into room: ${userRoom}`);



   socket.on('disconnect', () => {
    console.log(`❌ Client disconnected [ID: ${socket.id}] from room: ${userRoom}`);
  });

});



app.get('/', (req, res) => {
  res.send('LivePitch Backend is running');
});
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});