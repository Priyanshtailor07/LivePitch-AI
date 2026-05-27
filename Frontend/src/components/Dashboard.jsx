import React from 'react'
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { useSpeech } from '../hooks/useSpeech';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { sendSpeechChunk, feedback, isConnected } = useSocket();

  // Route the explicit string argument directly down the Socket pipeline
  const { isListening, transcript, startListening, stopListening } = useSpeech((textPayload) => {
    console.log("✈️ Sending explicit text payload down socket line:", textPayload);
    sendSpeechChunk(textPayload); 
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-50 font-sans">
      <header className="flex justify-between items-center px-8 py-4 bg-slate-900/40 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50">
        <h2 className="text-xl font-extrabold tracking-tight">
          LivePitch<span className="text-sky-400">.ai</span> - Welcome, {user?.displayName}!
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Avatar" className="h-9 w-9 rounded-full border border-sky-500/50 object-cover" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold">LP</div>
            )}
            <span className="text-sm font-medium hidden sm:inline text-slate-300">{user?.displayName}</span>
          </div>
          <button 
            onClick={logout} 
            className="h-8 px-3.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition-all duration-150 shadow-md shadow-rose-950/20 active:scale-95 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Grid Dashboard Panels */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 max-w-7xl mx-auto">
        {/* Left Side: Speech Input Stream */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between min-h-480px shadow-xl backdrop-blur-sm">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-sky-400">Speech Input Feed</h3>
            <p className="text-xs flex items-center gap-2 text-slate-400">
              Pipeline State:
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black tracking-wide border ${
                isConnected 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {isConnected ? 'SECURE' : 'DISCONNECTED'}
              </span>
            </p>
          </div>

          <div className="flex-grow flex flex-col justify-between pt-4">
            <div className="my-8 flex justify-center">
              {!isListening ? (
                <button 
                  onClick={startListening} 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-950/40 transition-all duration-150 active:scale-95 cursor-pointer"
                >
                  Start Practice Session
                </button>
              ) : (
                <button 
                  onClick={stopListening} 
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-amber-950/20 animate-pulse cursor-pointer"
                >
                  Pause Microphone
                </button>
              )}
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 grow flex flex-col min-h-40">
              <span className="text-[10px] tracking-wider text-slate-500 font-extrabold uppercase mb-2 block">
                Live Audio Transcript Preview
              </span>
              <p className={`text-sm leading-relaxed ${transcript ? 'text-slate-200' : 'text-slate-600 italic'}`}>
                {transcript || 'Click start and begin speaking to view live speech-to-text metrics...'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Real-time Evaluation Reports */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 min-h-480px shadow-xl backdrop-blur-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-sky-400">Instant AI Coach Analytics</h3>
            <p className="text-xs text-slate-400">Real-time evaluation data stream</p>
          </div>

          {feedback ? (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pacing</p>
                  <p className={`text-2xl font-black mt-1 ${feedback.pacing === 'Good' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {feedback.pacing}
                  </p>
                </div>
                <div className="flex-1 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tempo</p>
                  <p className="text-2xl font-black text-sky-400 mt-1">
                    {feedback.wpm} <span className="text-xs text-slate-500 font-normal">WPM</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Delivery Warnings:</h4>
                <div className="space-y-2">
                  {feedback.alerts && feedback.alerts.length > 0 ? (
                    feedback.alerts.map((alert, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-xl border text-sm transition duration-150 ${
                          alert.type === 'filler' 
                            ? 'bg-amber-950/10 border-amber-500/20 text-amber-300' 
                            : 'bg-cyan-950/10 border-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        <strong>{alert.type === 'filler' ? '⚠️ Style: ' : '💡 Content: '}</strong>
                        {alert.message}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-emerald-400 font-medium bg-emerald-950/10 p-4 rounded-xl border border-emerald-500/10">
                      ✨ Excellent delivery tempo! No speech patterns flagged yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center text-slate-600 space-y-3">
              <div className="w-6 h-6 rounded-full border-2 border-slate-800 border-t-sky-400 animate-spin" />
              <p className="text-sm font-medium text-slate-500">Waiting for voice telemetry...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard;