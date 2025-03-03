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
import Inventory from './components/GamePages/Inventory/Inventory';
import Summon from './components/GamePages/Chests/Summon';
import Equip from './components/GamePages/Equip/Equip';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FeylingSelect from './components/GamePages/Start/FeylingSelect';

const App: React.FC = () => {
  return (
    
    <AudioProvider>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={WelcomeWindow}/>
          <Route path="/login" Component={Login}/>
          <Route path="/mainmenu" Component={MainMenu}/>
          <Route path="/register" Component={Register}/>
          <Route path="/settings" Component={Settings}/>
          <Route path="/gamemenu" Component={GameMenu}/>
          <Route path='/itemchest' Component={ItemChest}/>
          <Route path='/feylings' Component={Feylings}/>
          <Route path='/inventory' Component={Inventory}/>
          <Route path='/summon' Component={Summon}/>
          <Route path='/equip' Component={Equip}/>
          <Route path='/feylingselect' Component={FeylingSelect}/>
        </Routes>
      </BrowserRouter>
    </AudioProvider>
    
  );
};

export default App;
