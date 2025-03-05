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
import Game from './components/GamePages/Start/Game/Game';
import { FeylingProvider } from './context/FeylingContext';

const App: React.FC = () => {
  return (
    <FeylingProvider>
      <AudioProvider>
        <ToastContainer />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WelcomeWindow/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/mainmenu" element={<MainMenu/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/settings" element={<Settings/>}/>
            <Route path="/gamemenu" element={<GameMenu/>}/>
            <Route path='/itemchest' element={<ItemChest/>}/>
            <Route path='/feylings' element={<Feylings/>}/>
            <Route path='/inventory' element={<Inventory/>}/>
            <Route path='/summon' element={<Summon/>}/>
            <Route path='/equip' element={<Equip/>}/>
            <Route path='/feylingselect' element={<FeylingSelect/>}/>
            <Route path='/game' element={<Game />}/>
          </Routes>
        </BrowserRouter>
      </AudioProvider>
    </FeylingProvider>
  );
};

export default App;
