import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Auth from './pages/Auth'
import SignUp from './pages/SignUp'
import Chat from './pages/Chat'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App 