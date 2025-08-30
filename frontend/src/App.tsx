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
import ProtectedRoute from './services/ProtectedRoute';
import Contact from './pages/Contact/Contact';
import Promotions from './pages/Promotions/Promotions';
import Recent from './pages/Recent/Recent';
import Favourites from './pages/Favourites/Favourites';

function App() {
  const [balance, setBalance] = useState(1000);

return (
      <div className="app-container">
        <Navbar/>
        <div className="main-layout">
          <div className='h-full hidden md:block'>
            <SideBarComponent/>
          </div>
          <main className="content-area">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/games" element={<Games />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile balance={balance} setBalance={setBalance} />
                </ProtectedRoute>}/>
              <Route path="/games/slot" element={<ProtectedRoute><SlotMachine/></ProtectedRoute>} />
              <Route path="/games/blackjack" element={<ProtectedRoute><BlackjackGame /></ProtectedRoute>} />
              <Route path="/games/roulette" element={<ProtectedRoute><CasinoRoulette /></ProtectedRoute>} />
              <Route path="/games/baccarat" element={<ProtectedRoute><BaccaratGame /></ProtectedRoute>} />
              <Route path="/games/progressive-slot" element={<ProtectedRoute><ProgressiveSlot /></ProtectedRoute>} />
              <Route path="/games/keno" element={<ProtectedRoute><Keno /></ProtectedRoute>} />
              <Route path="/games/scratch" element={<ProtectedRoute><ScratchGame /></ProtectedRoute>} />
              <Route path="/games/high-low" element={<ProtectedRoute><UpgradedHighLowGame /></ProtectedRoute>} />
              <Route path="/favourite" element={<ProtectedRoute><Favourites/></ProtectedRoute>} />
              <Route path="/recent" element={<ProtectedRoute><Recent/></ProtectedRoute>} />
              <Route path="/promotions" element={<Promotions/>} />
              <Route path="/contact" element={<Contact/>}/>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </main>
        </div>
      </div>

);
}

export default App;
