import React from 'react'

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { useAuth } from './context/AuthContext';




function App() {
    const { user, loading } = useAuth();
    if(loading){
       return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0b0f19] text-slate-400 font-sans">
        <div className="w-6 h-6 rounded-full border-2 border-slate-800 border-t-sky-400 animate-spin mr-3" />
        <span>Initializing session telemetry...</span>
      </div>
    );
  }
  return user?<Dashboard />:<Login />
}

export default App
