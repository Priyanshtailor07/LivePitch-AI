
import React from 'react'
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useCallback } from "react";
export const useSpeech = (onSentenceComplete) => {

    const [isListening,setIsListening]=useState(false);
    const [transcript,setTranscript]=useState('');
    const recognitionRef=useRef(null);
    useEffect(()=>{
        const SpeechRecoginition =window.SpeechRecognition || window.webkitSpeechRecognition;
            if(!SpeechRecoginition){
                console.error("Speech Recognition API not supported in this browser.");
                return;
            }
            const recognition = new SpeechRecoginition();
            recognition.continuous=true;
            recognition.interimResults=true;
            recognition.lang='en-US';
            recognition.onresult=(event)=>{
                let interimTranscript='';
                let finalTranscript='';
                for(let i=event.resultIndex;i<event.results.length;i++){
                    if(event.results[i].isFinal){   
                        finalTranscript+=event.results[i][0].transcript;
                    }else{
                        interimTranscript+=event.results[i][0].transcript;
                    }
                }
                setTranscript(finalTranscript ||interimTranscript);


              if (finalTranscript.trim() && onSentenceComplete) {
        onSentenceComplete(finalTranscript.trim());
      }
    };

                 recognition.onerror=(event)=>{
                    console.error("Speech recognition error:",event.error);
                    };

                    recognition.onend=()=>{
                        if(isListening&&recognitionRef.current){
                           try{
                            recognitionRef.current.start();
                           }
                           catch(error){
                            console.error("Error restarting speech recognition:",error);
                           }
                        }

                    };
                    recognitionRef.current=recognition;                    
    },[isListening,onSentenceComplete]);

    const startListening=useCallback(()=>{
        setIsListening(true);
        setTranscript('');
        if(recognitionRef.current){
            try{
                recognitionRef.current.start();
            }
            catch(error){
                console.error("Error starting speech recognition:",error);
            }
        }
    },[]);
    const stopListening=useCallback(()=>{
        setIsListening(false);
        if(recognitionRef.current){
            try{
                recognitionRef.current.stop();
            }catch(error){
                console.error("Error stopping speech recognition:",error);
            }
        }
    },[]);

  return {isListening,transcript,startListening,stopListening};
}

