import { useState } from 'react'
import './App.css'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Games from './pages/Games/Games';
import Profile from './pages/Profile/Profile';
import SlotMachine from './pages/Games/SlotMachine';
import Blackjack from './pages/Games/BlackJack';
import Roulette from './pages/Games/Roulette';

function App() {
  const [balance, setBalance] = useState(1000);


return (
<Router>
<Navbar balance={balance} />
<Routes>
<Route path="/" element={<Home />} />
<Route path="/games" element={<Games />} />
<Route path="/profile" element={<Profile balance={balance} setBalance={setBalance} />} />
<Route path="/games/slot" element={<SlotMachine balance={balance} setBalance={setBalance} />} />
<Route path="/games/blackjack" element={<Blackjack />} />
<Route path="/games/roulette" element={<Roulette />} />
</Routes>
</Router>
);
}

export default App
