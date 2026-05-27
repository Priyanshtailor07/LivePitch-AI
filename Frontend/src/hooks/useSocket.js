import React, { useEffect, useState,useRef,useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export const useSocket=()=>{
    const {token}=useAuth();
  const socketRef=useRef(null);
  const [feedback,setFeedback]=useState('');
  const [isConnected,setIsConnected]=useState(false);

  useEffect(()=>{
    if(!token){
        return ;
    }
    socketRef.current=io('http://localhost:5000',{
        auth:{token},
        transports:['websocket']
    });
    socketRef.current.on('connect',()=>{
        console.log('WebSocket connected');
        setIsConnected(true);
    });
    socketRef.current.on('live-feedback',(data)=>{
        socketRef.current.on('live-feedback', (data) => {
  console.log(' FRONTEND CAUGHT DATA EVENT:', data); 
  setFeedback(data);
});
        console.log('Received live feedback:',data);
        setFeedback(data);
    });

    socketRef.current?.on('disconnect',()=>{
    console.log('WebSocket disconnected');
    setIsConnected(false);
  });

  return ()=>{
    if(socketRef.current){
        socketRef.current.disconnect();}
        
  };

  },[token]);

const sendSpeechChunk = useCallback((textPayload) => {
  if (socketRef.current && isConnected) {
    console.log("Emitting raw string directly over socket:", textPayload);
   
    socketRef.current.emit('speech-chunk', textPayload); 
  }
}, [isConnected]);
    return {sendSpeechChunk,feedback,isConnected};
  

    
}