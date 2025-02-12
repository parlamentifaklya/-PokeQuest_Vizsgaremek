import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import React from 'react'
import MainMenu from './components/MainMenu'
import Settings from './components/Settings'
import { useAuth } from './context/AuthContext'
import requireAuth from './requireAuth/requireAuth'
import WelcomeWindow from './components/WelcomeWindow'
import Login from './components/Login'
import Register from './components/Register'

const App = () => {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' Component={WelcomeWindow}></Route>
          <Route path='/login' Component={Login}></Route>
          <Route path='mainmenu' Component={MainMenu}></Route>
          <Route path='/register' Component={Register}></Route>
          <Route path='/settings' Component={Settings}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App