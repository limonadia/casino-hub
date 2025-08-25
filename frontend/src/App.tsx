import { useState } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Games from './pages/Games/Games';
import Profile from './pages/Profile/Profile';
import SlotMachine from './pages/Games/SlotMachine/SlotMachine';
import BlackjackGame from './pages/Games/BlackJack/BlackJack';
import SideBarComponent from './components/Sidebar/SidebarComponent';
import BaccaratGame from './pages/Games/Baccarat/BaccaratGame';
import ProgressiveSlot from './pages/Games/ProgressiveSlot/ProgressiveSlot';
import Keno from './pages/Games/Keno/Keno';
import ScratchGame from './pages/Games/Scratch/ScratchCard';
import UpgradedHighLowGame from './pages/Games/HighLow/HighLowGame';
import CasinoRoulette from './pages/Games/Roulette/Roulette';
import Login from './pages/Login/Login';
import Signup from './pages/Login/Signup';


function App() {
  const [balance, setBalance] = useState(1000);

return (
      <div className="app-container">
        <Navbar balance={balance} />
        <div className="main-layout">
          <div className='h-full hidden md:block'>
            <SideBarComponent/>
          </div>
          <main className="content-area">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/games" element={<Games />} />
              <Route path="/profile" element={<Profile balance={balance} setBalance={setBalance} />} />
              <Route path="/games/slot" element={<SlotMachine/>} />
              <Route path="/games/blackjack" element={<BlackjackGame />} />
              <Route path="/games/roulette" element={<CasinoRoulette />} />
              <Route path="/games/baccarat" element={<BaccaratGame />} />
              <Route path="/games/progressive-slot" element={<ProgressiveSlot />} />
              <Route path="/games/keno" element={<Keno />} />
              <Route path="/games/scratch" element={<ScratchGame />} />
              <Route path="/games/high-low" element={<UpgradedHighLowGame />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </main>
        </div>
      </div>
);
}

export default App;
