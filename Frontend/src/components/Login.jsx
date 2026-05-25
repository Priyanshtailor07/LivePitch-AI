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

    <div style={style.container}>
        <div style={style.card}>
            <h1 style={style.title}>
                LivePitch<span style={style.ai}>ai</span>
            </h1>
           <p style={style.subtitle}> Real-Time speech analytics</p>
           <div style={style.buttonWrapper}>
            <GoogleLogin
            onSuccess={handleSuccess}
            onError ={()=>console.error("Google OAuth interface error")}
            useOneTap
            />
           </div>

        </div>  
    </div>

  )
}

const style = {
  container: { display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif' },
  card: { padding: '2.5rem', borderRadius: '12px', backgroundColor: '#1e293b', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', textAlign: 'center', maxWidth: '400px', width: '90%' },
  title: { fontSize: '2.25rem', margin: '0 0 0.5rem 0', fontWeight: '800', letterSpacing: '-0.05em' }, // <-- Fixed: Changed 'tracking' to 'letterSpacing'
  ai: { color: '#38bdf8' },
  subtitle: { color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 2rem 0', lineHeight: '1.5' },
  buttonWrapper: { display: 'flex', justifyContent: 'center' }
};
export default Login