import { useState } from 'react'
import reactLogo from './assets/react.svg'
import Login from './components/Login';
import { AuthProvider } from './context/AuthContext';



function App() {


  return (
    <>
      <AuthProvider>
      <Login/>
      </AuthProvider>
     
      
    
              
    </>
  )
}

export default App
