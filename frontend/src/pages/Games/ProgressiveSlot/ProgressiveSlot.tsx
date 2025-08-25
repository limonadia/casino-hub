import React, { useState, useEffect, useRef } from 'react';
import { Coins, Trophy, Zap, Star, Crown, Gem } from 'lucide-react';

const SYMBOLS = [
  { id: 1, emoji: '🍒', name: 'Cherry', multiplier: 2, rarity: 0.3 },
  { id: 2, emoji: '🍋', name: 'Lemon', multiplier: 3, rarity: 0.25 },
  { id: 3, emoji: '🔔', name: 'Bell', multiplier: 5, rarity: 0.2 },
  { id: 4, emoji: '💎', name: 'Diamond', multiplier: 10, rarity: 0.15 },
  { id: 5, emoji: '⭐', name: 'Star', multiplier: 15, rarity: 0.08 },
  { id: 6, emoji: '👑', name: 'Crown', multiplier: 25, rarity: 0.02 },
];

const SlotReel = ({ symbols, isSpinning, finalSymbol, reelIndex, spinDuration }:{ symbols: any, isSpinning: any, finalSymbol: any, reelIndex: any, spinDuration: any }) => {
  const [currentSymbol, setCurrentSymbol] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isSpinning) {
      intervalRef.current = setInterval(() => {
        setCurrentSymbol(prev => (prev + 1) % symbols.length);
      }, 100);

      setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setCurrentSymbol(finalSymbol);
      }, spinDuration + reelIndex * 200);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSpinning, finalSymbol, reelIndex, spinDuration]);

  return (
    <div className="relative w-24 h-32 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg border-2 border-yellow-500 overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-transparent"></div>
      <div className={`flex items-center justify-center h-full transition-all duration-300 ${isSpinning ? 'animate-bounce' : ''}`}>
        <div className="text-4xl drop-shadow-lg">
          {symbols[currentSymbol].emoji}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
    </div>
  );
};

const WinAnimation = ({ show, amount, type }: { show: any, amount: any, type: any }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className={`animate-pulse text-6xl font-bold ${
        type === 'jackpot' ? 'text-yellow-400' : 
        type === 'big' ? 'text-purple-400' : 'text-green-400'
      } drop-shadow-2xl`}>
        {type === 'jackpot' && '🎰 JACKPOT! 🎰'}
        {type === 'big' && '💎 BIG WIN! 💎'}
        {type === 'normal' && `🎉 WIN ${amount}! 🎉`}
      </div>
    </div>
  );
};

const PremiumSlotMachine = () => {
  const [balance, setBalance] = useState(10000);
  const [bet, setBet] = useState(100);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelResults, setReelResults] = useState([0, 0, 0, 0, 0]);
  const [lastWin, setLastWin] = useState(0);
  const [jackpot, setJackpot] = useState(500000);
  const [winStreak, setWinStreak] = useState(0);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [winType, setWinType] = useState('normal');
  const [freeSpins, setFreeSpins] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);

  const playSound = (type: string) => {
    // Sound would be implemented here with actual audio files
    console.log(`Playing ${type} sound`);
  };

  const spinReels = async () => {
    if (isSpinning || balance < bet) return;

    const spinCost = freeSpins > 0 ? 0 : bet;
    setBalance(prev => prev - spinCost);
    if (freeSpins > 0) setFreeSpins(prev => prev - 1);
    
    setIsSpinning(true);
    setLastWin(0);
    setGamesPlayed(prev => prev + 1);
    playSound('spin');

    // Simulate API call to backend for RNG
    const results: React.SetStateAction<number[]> = [];
    for (let i = 0; i < 5; i++) {
      const random = Math.random();
      let symbolIndex = 0;
      let cumulative = 0;
      
      for (let j = 0; j < SYMBOLS.length; j++) {
        cumulative += SYMBOLS[j].rarity;
        if (random <= cumulative) {
          symbolIndex = j;
          break;
        }
      }
      results.push(symbolIndex);
    }

    setReelResults(results);

    // Stop spinning after animation
    setTimeout(() => {
      setIsSpinning(false);
      calculateWinnings(results);
    }, 3000);
  };

  const calculateWinnings = (results: any[]) => {
    let winAmount = 0;
    const symbolCounts: any = {};
    
    // Count symbol occurrences
    results.forEach((symbolIndex: any) => {
      const symbolId = SYMBOLS[symbolIndex].id;
      symbolCounts[symbolId] = (symbolCounts[symbolId] || 0) + 1;
    });

    // Calculate winnings
    // Fix for TypeScript version
Object.entries(symbolCounts).forEach(([symbolId, count]) => {
  // Fix 1: Type assertion for count
  const symbolCount = count as number;
  
  if (symbolCount >= 3) {
    // Fix 2: Handle undefined symbol with optional chaining and early return
    const symbol = SYMBOLS.find(s => s.id === parseInt(symbolId));
    if (!symbol) return; // Skip if symbol not found
    
    const baseWin = bet * symbol.multiplier;
    const multiplier = symbolCount === 3 ? 1 : symbolCount === 4 ? 3 : 10;
    winAmount += baseWin * multiplier;
  }
});

    // Bonus features
    if (winAmount > 0) {
      setWinStreak(prev => prev + 1);
      
      // Streak bonus
      if (winStreak >= 3) {
        winAmount *= 1.5;
      }

      // Random free spins
      if (Math.random() < 0.1 && winAmount > bet * 5) {
        setFreeSpins(prev => prev + 5);
      }

      // Jackpot chance (very rare)
      if (Math.random() < 0.001) {
        winAmount += jackpot;
        setJackpot(500000); // Reset jackpot
        setWinType('jackpot');
      } else if (winAmount > bet * 20) {
        setWinType('big');
      } else {
        setWinType('normal');
      }

      setBalance(prev => prev + winAmount);
      setLastWin(winAmount);
      setTotalWins(prev => prev + winAmount);
      setShowWinAnimation(true);
      playSound(winType);

      setTimeout(() => setShowWinAnimation(false), 3000);
    } else {
      setWinStreak(0);
    }

    // Increase jackpot
    setJackpot(prev => prev + bet * 0.1);
  };

  const changeBet = (amount: number) => {
    if (!isSpinning) {
      setBet(Math.max(10, Math.min(1000, amount)));
    }
  };

  const maxBet = () => {
    setBet(1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <WinAnimation show={showWinAnimation} amount={lastWin} type={winType} />
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-2">
          🎰 ROYAL SLOTS 🎰
        </h1>
        <div className="text-yellow-300 text-lg">Premium Casino Experience</div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-4 text-center">
            <Coins className="w-8 h-8 mx-auto mb-2 text-white" />
            <div className="text-2xl font-bold text-white">${balance.toLocaleString()}</div>
            <div className="text-green-100 text-sm">Balance</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-white" />
            <div className="text-2xl font-bold text-white">${jackpot.toLocaleString()}</div>
            <div className="text-purple-100 text-sm">Jackpot</div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-4 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-white" />
            <div className="text-2xl font-bold text-white">{freeSpins}</div>
            <div className="text-blue-100 text-sm">Free Spins</div>
          </div>

          <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-white" />
            <div className="text-2xl font-bold text-white">{winStreak}</div>
            <div className="text-orange-100 text-sm">Win Streak</div>
          </div>

          <div className="bg-gradient-to-r from-pink-600 to-pink-500 rounded-lg p-4 text-center">
            <Gem className="w-8 h-8 mx-auto mb-2 text-white" />
            <div className="text-2xl font-bold text-white">${lastWin.toLocaleString()}</div>
            <div className="text-pink-100 text-sm">Last Win</div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="max-w-4xl mx-auto">
        {/* Slot Machine */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-8 mb-8 border-4 border-yellow-500 shadow-2xl">
          <div className="flex justify-center gap-4 mb-8">
            {reelResults.map((symbolIndex, reelIndex) => (
              <SlotReel
                key={reelIndex}
                symbols={SYMBOLS}
                isSpinning={isSpinning}
                finalSymbol={symbolIndex}
                reelIndex={reelIndex}
                spinDuration={2000}
              />
            ))}
          </div>

          {/* Payline Indicator */}
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-md h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full"></div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center space-y-6">
            {/* Bet Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => changeBet(bet - 50)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                disabled={isSpinning}
              >
                -$50
              </button>
              <div className="text-2xl font-bold text-yellow-400">
                Bet: ${bet}
              </div>
              <button
                onClick={() => changeBet(bet + 50)}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                disabled={isSpinning}
              >
                +$50
              </button>
              <button
                onClick={maxBet}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                disabled={isSpinning}
              >
                Max Bet
              </button>
            </div>

            {/* Spin Button */}
            <button
              onClick={spinReels}
              disabled={isSpinning || balance < bet}
              className={`px-16 py-6 text-2xl font-bold rounded-2xl transition-all transform ${
                isSpinning || balance < bet
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white shadow-2xl hover:scale-105 active:scale-95'
              }`}
            >
              {isSpinning ? '🎰 SPINNING...' : freeSpins > 0 ? '🎁 FREE SPIN!' : '🎰 SPIN!'}
            </button>
          </div>
        </div>

        {/* Paytable */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 border-2 border-slate-600">
          <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-center">💰 PAYTABLE 💰</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SYMBOLS.map(symbol => (
              <div key={symbol.id} className="bg-slate-700 rounded-lg p-3 text-center">
                <div className="text-3xl mb-2">{symbol.emoji}</div>
                <div className="text-white font-bold">{symbol.name}</div>
                <div className="text-yellow-400 text-sm">{symbol.multiplier}x bet</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-gray-300 text-sm">
            Match 3+ symbols on the payline to win! • 5 of a kind = 10x multiplier
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumSlotMachine;