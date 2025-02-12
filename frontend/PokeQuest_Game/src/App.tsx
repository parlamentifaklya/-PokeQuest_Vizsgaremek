import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import React from 'react'
import MainMenu from './components/MainMenu'
import Settings from './components/Settings'


const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' Component={MainMenu}></Route>
          <Route path='/settings' Component={Settings}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App