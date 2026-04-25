import React from 'react'
import { Routes, Route } from 'react-router-dom' 
import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import ResumeBuilder from './pages/ResumeBuilder'
import Review from './pages/Review'
import Login from './pages/Login'
function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='app' element={<Layout/>}>
          <Route index element={<Dashboard/>} />
          <Route path = 'builder/:resumeId' element={<ResumeBuilder/>}/>
        </Route>
        <Route path='view/:resumeId' element={<Review/>}/>
        <Route path='/login' element={<Login/>}/>
      </Routes>
    </>
  )
}

export default App
