import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {GoogleGenAI} from '@google/genai';
import {contextManager} from './services/contextManager.js';
import authRoutes from './routes/authRoutes.js';

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

const ai= new GoogleGenAI({apiKey:process.env.GOOGLE_API_KEY});

app.use('/api/auth',authRoutes);



io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    console.log(" Gatekeeper: No token found. Slamming the door!");
    // CRITICAL: You must return next(error) so execution STOPS here
    return next(new Error("Authentication error: Missing Token"));
  }

    try{
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    }
    catch(error){
      console.log("Socket connection failed!");
      return next(new Error("Authentication error: Invalid Token"));
    }
 
})


io.on('connection', (socket) => {
   const userId=socket.userId;
   const userRoom=`room:${userId}`;
   socket.join(userRoom);
   console.log(`User verified and locked into room: ${userRoom}`);

   socket.on('speech-chunk', async (data) => {
    try{
      if(!data || !data.text ){
        
        return;
      }

      contextManager.addChunks(userId, data.text);
      const recentSpeechContext=contextManager.getContextWindow(userId);
    console.log(`[Memory Monitor] Context for ${userId}: "${recentSpeechContext}"`);
    const responseStream=await ai.models.genai.generateContentStream({
  model:'models/gemini-2.5-flash',
  contents:contents: `Analyze this rolling context of a student's live interview speech: "${recentSpeechContext}"`,

      config:{
        systemInstruction: `
            You are a real-time speech and interview coach. Analyze the user's incoming text for pacing, filler words ('um', 'like', 'so'), and technical concepts.
            You must output data ONLY in a valid, minified JSON object. Do not include markdown code block formatting like \`\`\`json.
            
            The JSON structure must match this scheme exactly:
            {
              "pacingStatus": "Good" | "Too Fast" | "Too Slow",
              "wpmEstimate": 140,
              "alerts": [
                { "type": "filler", "message": "Drop the word 'like'. Speak with confidence." },
                { "type": "keyword", "message": "Tip: You mentioned MongoDB, now explicitly explain horizontal scaling." }
              ]
            }
            If no alerts are necessary, leave the alerts array empty.
          `,
          responseMimeType:'application/json' // Core SDK setting enforcing structural JSON parsing
      }
    
    });
    let fullResponse='';
    for await (const chunk of responseStream){
      fullResponse+=chunk.text;
    }
    const parsedFeedback=JSON.parse(fullResponse);
    if(parsedFeedback.alerts && parsedFeedback.alerts.length>0){
      io.to(userRoom).emit('live-feedback', parsedFeedback);
      console.log(`[Feedback Dispatched] To ${userRoom}:`, parsedFeedback);

    }
    catch(error){
      console.error('Error processing speech chunk:',error.message);
   });


   socket.on('disconnect', () => {
    console.log(`Client disconnected [ID: ${socket.id}] from room: ${userRoom}`);
  });

});




app.get('/', (req, res) => {
  res.send('LivePitch Backend is running');
});
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});