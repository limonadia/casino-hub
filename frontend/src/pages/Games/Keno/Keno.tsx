import React, { useState, useEffect } from 'react';
import { Coins, Zap, Trophy, Volume2, VolumeX, Crown, Sparkles } from 'lucide-react';

const totalNumbers = 80;
const jackpotBase = 50000;

const payoutTable: any = {
  1: [0, 3],
  2: [0, 2, 12],
  3: [0, 1, 3, 46],
  4: [0, 1, 2, 5, 91],
  5: [0, 0, 2, 4, 21, 387],
  6: [0, 0, 1, 3, 7, 40, 1500],
  7: [0, 0, 1, 2, 4, 20, 100, 7500],
  8: [0, 0, 0, 2, 3, 9, 44, 335, 25000],
  9: [0, 0, 0, 1, 2, 5, 25, 142, 1000, 40000],
  10: [0, 0, 0, 0, 2, 4, 17, 70, 400, 1800, 100000]
};

interface KenoNumber {
  value: number;
  selected: boolean;
  hit: boolean;
  justDrawn: boolean;
}

interface GameHistoryEntry {
  round: number;
  selected: number;
  hits: number;
  payout: number;
  bet: number;
}

type GameState = 'idle' | 'drawing' | 'complete';
type DrawSpeed = 'slow' | 'normal' | 'fast';

const Keno = () => {
  const [numbers, setNumbers] = useState<KenoNumber[]>(
    Array.from({ length: totalNumbers }, (_, i) => ({
      value: i + 1,
      selected: false,
      hit: false,
      justDrawn: false
    }))
  );
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [balance, setBalance] = useState(10000);
  const [jackpot, setJackpot] = useState(jackpotBase);
  const [bet, setBet] = useState(100);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [message, setMessage] = useState('Select 1-10 numbers and place your bet!');
  const [confetti, setConfetti] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [drawSpeed, setDrawSpeed] = useState<DrawSpeed>('normal');
  const [animatingNumber, setAnimatingNumber] = useState<number | null>(null);
  const [totalPayout, setTotalPayout] = useState(0);

  const selectedCount = numbers.filter(n => n.selected).length;
  const hitCount = numbers.filter(n => n.hit && n.selected).length;

  // Auto increment jackpot
  useEffect(() => {
    const interval = setInterval(() => {
      setJackpot(prev => prev + Math.floor(Math.random() * 100) + 50);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleSelect = (num: number) => {
    if (gameState !== 'idle') return;
    
    setNumbers(prev => {
      const newNumbers = prev.map(n => {
        if (n.value === num) {
          if (n.selected) {
            return { ...n, selected: false };
          } else if (selectedCount < 10) {
            return { ...n, selected: true };
          }
        }
        return n;
      });
      return newNumbers;
    });
  };

  const calculatePayout = (spots: number, hits: number): number => {
    if (spots === 0 || !payoutTable[spots]) return 0;
    const multiplier = payoutTable[spots][hits] || 0;
    return bet * multiplier;
  };

  const drawNumbers = async () => {
    const selectedNumbers = numbers.filter(n => n.selected);
    if (selectedNumbers.length === 0) {
      setMessage('❌ Please select at least 1 number!');
      return;
    }

    if (balance < bet) {
      setMessage('❌ Insufficient balance!');
      return;
    }

    setBalance(prev => prev - bet);
    setGameState('drawing');
    setMessage('🎲 Drawing numbers...');
    setDrawnNumbers([]);
    
    // Reset previous game state
    setNumbers(prev => prev.map(n => ({ ...n, hit: false, justDrawn: false })));

    // Generate 20 unique random numbers
    const drawn: number[] = [];
    const availableNumbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);
    
    for (let i = 0; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      drawn.push(availableNumbers.splice(randomIndex, 1)[0]);
    }

    // Animate drawing process
    const speed = drawSpeed === 'fast' ? 50 : drawSpeed === 'slow' ? 200 : 100;
    
    for (let i = 0; i < drawn.length; i++) {
      await new Promise(resolve => setTimeout(resolve, speed));
      
      setAnimatingNumber(drawn[i]);
      setDrawnNumbers(prev => [...prev, drawn[i]]);
      
      if (soundEnabled) {
        // Simple beep sound simulation
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSMFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkfDShvxu3ajiwELHfK8uiTTAsRXrXs7aVTHwdOr+j3xHkrBzWO3v3EdMx7');
        audio.volume = 0.1;
        audio.play().catch(() => {});
      }
      
      // Mark number as just drawn
      setNumbers(prev => prev.map(n => 
        n.value === drawn[i] ? { ...n, justDrawn: true } : n
      ));
      
      await new Promise(resolve => setTimeout(resolve, 50));
      setAnimatingNumber(null);
    }

    // Calculate hits and payout
    let hits = 0;
    setNumbers(prev => prev.map(n => {
      if (n.selected && drawn.includes(n.value)) {
        hits++;
        return { ...n, hit: true };
      }
      return n;
    }));

    const payout = calculatePayout(selectedCount, hits);
    let finalPayout = payout;
    
    // Jackpot check (10/10 hits or special conditions)
    let isJackpot = false;
    if (selectedCount === 10 && hits === 10) {
      finalPayout += jackpot;
      isJackpot = true;
      setJackpot(jackpotBase);
    }

    setTotalPayout(finalPayout);
    setBalance(prev => prev + finalPayout);
    
    // Update game state and messages
    setGameState('complete');
    
    if (isJackpot) {
      setMessage(`🎰 MEGA JACKPOT! 10/10 numbers! Won ${finalPayout.toLocaleString()} coins!`);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 5000);
    } else if (finalPayout > bet * 10) {
      setMessage(`🎉 BIG WIN! ${hits}/${selectedCount} numbers! Won ${finalPayout.toLocaleString()} coins!`);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
    } else if (finalPayout > 0) {
      setMessage(`✨ Winner! ${hits}/${selectedCount} numbers! Won ${finalPayout.toLocaleString()} coins!`);
    } else {
      setMessage(`😔 No luck this time. ${hits}/${selectedCount} numbers matched.`);
    }

    // Add to game history
    setGameHistory(prev => [{
      round: prev.length + 1,
      selected: selectedCount,
      hits: hits,
      payout: finalPayout,
      bet: bet
    }, ...prev.slice(0, 9)]);

    // Increment progressive jackpot
    setJackpot(prev => prev + Math.floor(bet * 0.05));

    setTimeout(() => {
      setNumbers(prev => prev.map(n => ({ ...n, justDrawn: false })));
    }, 2000);
  };

  const quickPick = () => {
    if (gameState !== 'idle') return;
    
    // Clear previous selections
    setNumbers(prev => prev.map(n => ({ ...n, selected: false })));
    
    // Select 5-10 random numbers
    const numToSelect = Math.floor(Math.random() * 6) + 5;
    const availableNumbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);
    const selected: any = [];
    
    for (let i = 0; i < numToSelect; i++) {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      selected.push(availableNumbers.splice(randomIndex, 1)[0]);
    }
    
    setNumbers(prev => prev.map(n => 
      selected.includes(n.value) ? { ...n, selected: true } : n
    ));
  };

  const clearAll = () => {
    if (gameState !== 'idle') return;
    setNumbers(prev => prev.map(n => ({ ...n, selected: false, hit: false })));
  };

  const newGame = () => {
    setGameState('idle');
    setNumbers(prev => prev.map(n => ({ ...n, selected: false, hit: false, justDrawn: false })));
    setDrawnNumbers([]);
    setMessage('Select 1-10 numbers and place your bet!');
    setTotalPayout(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Confetti Effect */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 100 }, (_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-yellow-400 mr-2" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              KENO ROYAL
            </h1>
            <Crown className="w-8 h-8 text-yellow-400 ml-2" />
          </div>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center bg-green-900/30 px-3 py-1 rounded">
              <Coins className="w-4 h-4 mr-1 text-green-400" />
              <span className="font-mono">${balance.toLocaleString()}</span>
            </div>
            <div className="flex items-center bg-yellow-900/30 px-3 py-1 rounded animate-pulse">
              <Trophy className="w-4 h-4 mr-1 text-yellow-400" />
              <span className="font-mono">${jackpot.toLocaleString()}</span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <div className="grid grid-cols-10 gap-2 mb-6">
                {numbers.map(n => (
                  <button
                    key={n.value}
                    onClick={() => toggleSelect(n.value)}
                    disabled={gameState !== 'idle'}
                    className={`
                      w-12 h-12 rounded-full font-bold text-sm transition-all duration-200 relative overflow-hidden
                      ${n.hit && n.selected
                        ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-500/50 animate-pulse'
                        : n.selected
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                        : drawnNumbers.includes(n.value)
                        ? 'bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg shadow-red-500/30'
                        : 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-gray-200'
                      }
                      ${animatingNumber === n.value ? 'animate-bounce scale-110 shadow-2xl' : ''}
                      ${n.justDrawn ? 'animate-pulse' : ''}
                    `}
                  >
                    {n.value}
                    {n.hit && n.selected && (
                      <Sparkles className="absolute inset-0 w-full h-full text-yellow-300 animate-spin" />
                    )}
                  </button>
                ))}
              </div>

              {/* Game Controls */}
              <div className="flex flex-wrap gap-4 items-center justify-center">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Bet:</label>
                  <select
                    value={bet}
                    onChange={(e) => setBet(Number(e.target.value))}
                    disabled={gameState !== 'idle'}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm"
                  >
                    {[50, 100, 250, 500, 1000, 2500].map(b => (
                      <option key={b} value={b}>${b}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Speed:</label>
                  <select
                    value={drawSpeed}
                    onChange={(e: any) => setDrawSpeed(e.target.value)}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm"
                  >
                    <option value="slow">Slow</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>

                <button
                  onClick={quickPick}
                  disabled={gameState !== 'idle'}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-semibold text-sm transition-colors"
                >
                  <Zap className="w-4 h-4 inline mr-1" />
                  Quick Pick
                </button>

                <button
                  onClick={clearAll}
                  disabled={gameState !== 'idle'}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-semibold text-sm transition-colors"
                >
                  Clear All
                </button>

                {gameState === 'idle' ? (
                  <button
                    onClick={drawNumbers}
                    disabled={selectedCount === 0}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105"
                  >
                    DRAW ({selectedCount} numbers)
                  </button>
                ) : (
                  <button
                    onClick={newGame}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105"
                  >
                    NEW GAME
                  </button>
                )}
              </div>
            </div>

            {/* Game Status */}
            <div className="mt-4 p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/30">
              <p className="text-center text-lg font-semibold">{message}</p>
              {drawnNumbers.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-300 mb-2">Drawn Numbers:</p>
                  <div className="flex flex-wrap gap-1">
                    {drawnNumbers.map(num => (
                      <span key={num} className="px-2 py-1 bg-red-600 rounded text-sm font-mono">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {totalPayout > 0 && (
                <div className="mt-3 text-center">
                  <span className="text-2xl font-bold text-green-400">
                    +${totalPayout.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Payout Table */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
              <h3 className="font-bold mb-3 text-center">Payout Table</h3>
              <div className="space-y-1 text-xs">
                {selectedCount > 0 && payoutTable[selectedCount] && payoutTable[selectedCount].map((multiplier: any, hits: any) => (
                  <div key={hits} className={`flex justify-between ${hits === hitCount ? 'bg-yellow-600/30 px-2 py-1 rounded' : ''}`}>
                    <span>{hits}/{selectedCount}</span>
                    <span>{multiplier}x</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Game History */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
              <h3 className="font-bold mb-3 text-center">Recent Games</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {gameHistory.map((game, index) => (
                  <div key={index} className="text-xs bg-gray-800/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>#{game.round}</span>
                      <span className={game.payout > game.bet ? 'text-green-400' : 'text-red-400'}>
                        {game.payout > game.bet ? '+' : ''}${(game.payout - game.bet).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-gray-400">
                      {game.hits}/{game.selected} hits
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
              <h3 className="font-bold mb-3 text-center">Game Info</h3>
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span>Numbers Selected:</span>
                  <span>{selectedCount}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Bet:</span>
                  <span>${bet}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Payout:</span>
                  <span>${selectedCount > 0 && payoutTable[selectedCount] ? (Math.max(...payoutTable[selectedCount]) * bet).toLocaleString() : 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Keno;