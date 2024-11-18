import { useEffect, useState } from 'react'
import './App.css'
import { Route, Routes, useNavigate } from 'react-router-dom'
import ChatPage from './pages/ChatPage'
import LoginSignup from '../src/components/Auth'
import Verify from './pages/Verify'
import VideoCallPage from './pages/VideoCallPage'



function App() {


  return (
    <Routes>
      <Route path='/' element={<ChatPage />} />
      <Route path='/auth' element={<LoginSignup />} />
      <Route path='/verify/:id' element={<Verify />} />
      <Route path='/video' element={<VideoCallPage />} />
      <Route path='*' element={<div>Page Not found</div>} />
    </Routes>
  )
}

export default App
