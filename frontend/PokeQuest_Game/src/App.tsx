import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainMenu from './components/MainMenu';
import Settings from './components/Settings';
import WelcomeWindow from './components/WelcomeWindow';
import Login from './components/Login';
import Register from './components/Register';
import GameMenu from './components/GamePages/GameMenu';
import { AudioProvider } from './context/AudioContext';
import ItemChest from './components/GamePages/Chests/ItemChest';
import Feylings from './components/GamePages/Feylings/Feylings';

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
          <Route path='/itemchest' Component={ItemChest}/>
          <Route path='/feylings' Component={Feylings}/>
        </Routes>
      </BrowserRouter>
    </AudioProvider>
  );
};

export default App;
