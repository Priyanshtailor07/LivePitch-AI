import React from 'react'
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();

    const handleSuccess = async (credentialResponse) => {
        try {
            console.log('Google token received, hitting backend exchange server...')
            const response = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: credentialResponse.credential }),
            });
            const data = await response.json();
            if (!response.ok) {
                console.error('Authentication failed:', data.message);
                return;
            }
            login(data.token, data.user);
            console.log(`Welcome back ${data.user.displayName}`)
        } catch (error) {
            console.error('Error during authentication:', error);
            alert('Authentication failed. Please try again.');
        }
    };
  return (

    <div className="flex h-screen w-screen items-center justify-center bg-[#0b0f19] px-4 font-sans">
        <div className="w-full max-w-md border border-slate-800 bg-slate-900/50 rounded-2xl p-8 shadow-2xl backdrop-blur-md text-center space-y-6">

            <div className="space-y-2">

            <h1 className="text-4xl font-black tracking-tight text-white">
                LivePitch<span className="text-sky-400">.ai</span>
            </h1><p className="text-slate-400 text-sm">
            Real-time speech analytics & instant AI interview coaching.
          </p>        



                </div>
                <div className="flex justify-center bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 shadow-inner">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.error("Google OAuth interface error")}
            useOneTap
          />
        </div>
        </div>  
    </div>

  )
}


export default Login