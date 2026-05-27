import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {AuthProvider} from './context/AuthContext.jsx';
import {GoogleOAuthProvider} from '@react-oauth/google';

const GOOGLE_CLIENT_ID="1072622151650-7oc3hri15boub93adpnc65jelhms0vlq.apps.googleusercontent.com"
createRoot(document.getElementById('root')).render(
  <StrictMode>
    
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>

  <AuthProvider>
  <App />
 
  </AuthProvider>
 

  
    </GoogleOAuthProvider>
  </StrictMode>,
)
