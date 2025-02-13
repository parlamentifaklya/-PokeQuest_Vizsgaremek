import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainMenu from './components/MainMenu';
import Settings from './components/Settings';
import WelcomeWindow from './components/WelcomeWindow';
import Login from './components/Login';
import Register from './components/Register';
import GameMenu from './components/GamePages/GameMenu';
import { AudioProvider } from './context/AudioContext';

const App: React.FC = () => {
  return (
    <AudioProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={WelcomeWindow}></Route>
          <Route path="/login" Component={Login}></Route>
          <Route path="/mainmenu" Component={MainMenu}></Route>
          <Route path="/register" Component={Register}></Route>
          <Route path="/settings" Component={Settings}></Route>
          <Route path="/gamemenu" Component={GameMenu}></Route>
        </Routes>
      </BrowserRouter>
    </AudioProvider>
  );
};

export default App;
