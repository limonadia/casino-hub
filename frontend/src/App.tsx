import { useState } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Games from './pages/Games/Games';
import Profile from './pages/Profile/Profile';
import SlotMachine from './pages/Games/SlotMachine';
import Blackjack from './pages/Games/BlackJack';
import Roulette from './pages/Games/Roulette';
import SideBarComponent from './components/Sidebar/SidebarComponent';

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
              <Route path="/games/slot" element={<SlotMachine balance={balance} setBalance={setBalance} />} />
              <Route path="/games/blackjack" element={<Blackjack />} />
              <Route path="/games/roulette" element={<Roulette />} />
            </Routes>
          </main>
        </div>
      </div>
);
}

export default App;
