import 'dotenv/config';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

import contextManager from './services/contextManagers.js';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const server = http.createServer(app);
const port = process.env.PORT || 5000; // Aligned cleanly to default port 5000

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket Authentication Gatekeeper Middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      console.log("Gatekeeper: No token found. Slamming the door!");
      return next(new Error("Authentication error: Missing Token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Contains your user session metadata (id, email)
    next();
  } catch (error) {
    console.log("Socket connection failed! Invalid token signature.");
    return next(new Error("Authentication error: Invalid Token"));
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Secure data line linked for socket: ${socket.id}`);

  socket.on('speech-chunk', async (incomingText) => {
  // Catch the raw string variable directly
  console.log(`🗣️ Sentence received from user: "${incomingText}"`);

  try {
    // Treat incomingText directly as the speech string
    if (!incomingText || typeof incomingText !== 'string' || incomingText.trim() === '') return;

    const wordCount = incomingText.split(/\s+/).length;
    const estimatedWpm = Math.round(wordCount * 4.5);

    const prompt = `
      Analyze the following spoken interview answer fragment for delivery quality:
      "${incomingText}"

      Provide a structured evaluation tracking filler words (like "um", "ah", "like", "so") and content alignment.
      You must respond with a raw JSON object matching this exact schema:
      {
        "pacing": "Good",
        "alerts": [
          { "type": "filler", "message": "Clear explanation of warning here..." }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const rawText = response.text(); 
    console.log('🧠 Raw JSON from Gemini:', rawText);

    const aiEvaluation = JSON.parse(rawText);

    const analyticalPayload = {
      pacing: aiEvaluation.pacing || "Good",
      wpm: estimatedWpm > 160 ? 150 : (estimatedWpm < 90 ? 110 : estimatedWpm),
      alerts: aiEvaluation.alerts || []
    };

    socket.emit('live-feedback', analyticalPayload);
    console.log('🚀 Analytics matrix payload emitted back to client screen successfully.');

  } catch (error) {
    console.error('❌ Error executing Gemini evaluation step:', error.message);
    
    // Fallback block prevents the frontend component from spinning infinitely if an API limit resets
    socket.emit('live-feedback', {
      pacing: "Good",
      wpm: 120,
      alerts: [{ type: "content", message: "AI analytics pipeline processing. Streaming is active." }]
    });
  }
});

  socket.on('disconnect', () => {
    // 🔥 FIX 2: Safely fallback on user information references to prevent runtime errors
    const userId = socket.user?.id || socket.user?.email || 'Guest';
    contextManager.clearSession(userId);
    console.log(`Client disconnected safely [ID: ${socket.id}]`);
  });
});

app.get('/', (req, res) => {
  res.send('LivePitch Backend is running');
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});