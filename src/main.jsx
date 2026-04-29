import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

const Inner = () => (
  <ThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
)

async function mount() {
  let root = (
    <React.StrictMode>
      <Inner />
    </React.StrictMode>
  )

  if (import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    const { GoogleOAuthProvider } = await import('@react-oauth/google')
    root = (
      <React.StrictMode>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <Inner />
        </GoogleOAuthProvider>
      </React.StrictMode>
    )
  }

  ReactDOM.createRoot(document.getElementById('root')).render(root)
}

mount()
