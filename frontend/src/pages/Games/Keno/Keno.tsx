import { useState } from 'react';
import { Zap, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../../../services/authContext';
import { kenoService } from '../../../services/kenoService';
import { motion } from 'framer-motion';

const totalNumbers = 80;

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
  const [bet, setBet] = useState(100);
  const [message, setMessage] = useState('Select 1-10 numbers and place your bet!');
  const [animatingNumber] = useState<number | null>(null);
  const [totalPayout, setTotalPayout] = useState(0);
  const { balance, setBalance } = useAuth();

  const selectedCount = numbers.filter(n => n.selected).length;
  const hitCount = numbers.filter(n => n.hit && n.selected).length;

  const toggleSelect = (num: number) => {
    
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

  const drawNumbers = async () => {
    if (selectedCount === 0) return;
  
    const selectedNumbers = numbers.filter(n => n.selected).map(n => n.value);
    const res: any = await kenoService.play(selectedNumbers, bet);
    console.log("response", res);
  
    setDrawnNumbers(res.drawnNumbers);
  
    setNumbers(prev => prev.map(n => ({
      ...n,
      hit: n.selected && res.drawnNumbers.includes(n.value)
    })));
  
    setTotalPayout(res.payout);
  
    setBalance(res.newBalance);
  
    setMessage(res.message);
  };
  

  const quickPick = () => {
    
    setNumbers(prev => prev.map(n => ({ ...n, selected: false })));
    
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
    setNumbers(prev => prev.map(n => ({ ...n, selected: false, hit: false })));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">

      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-center mb-8 relative z-10">
            <motion.h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 mb-2"
              animate={{ 
                textShadow: [
                  "0 0 20px #ffd700",
                  "0 0 40px #ffd700, 0 0 60px #ff6b6b",
                  "0 0 20px #ffd700"
                ]
              }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <span className='flex items-center justify-center gap-3'>
                  <Crown className="w-8 h-8 text-yellow-400 mr-2" />
                    KENO ROYAL
                  <Crown className="w-8 h-8 text-yellow-400 ml-2" />
                </span>
            </motion.h1>
          </div>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex gap-6 bg-black/30 rounded-xl p-4 border border-yellow-500/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-500 flex items-center"><span className="material-symbols-outlined">poker_chip</span>{balance.toLocaleString()}</div>
                <div className="text-sm text-grey-300">COINS</div>
              </div>
            </div>
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
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm"
                  >
                    {[50, 100, 250, 500, 1000, 2500].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={quickPick}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-semibold text-sm transition-colors"
                >
                  <Zap className="w-4 h-4 inline mr-1" />
                  Quick Pick
                </button>

                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-semibold text-sm transition-colors"
                >
                  Clear All
                </button>

                  <button
                    onClick={drawNumbers}
                    disabled={selectedCount === 0}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105"
                  >
                    DRAW ({selectedCount} numbers)
                  </button>
              </div>
            </div>

            <div className='w-full flex items-center justify-center'>
              {totalPayout > 0 && (
                  <div className="mt-3 text-center">
                    <span className="text-2xl font-bold text-green-400 flex items-center">
                      +<span className="material-symbols-outlined">poker_chip</span> {totalPayout.toLocaleString()}
                    </span>
                  </div>
                )}
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
                  <span className='flex items-center'><span className="material-symbols-outlined">poker_chip</span> {bet}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Payout:</span>
                  <span className='flex items-center'><span className="material-symbols-outlined">poker_chip</span> {selectedCount > 0 && payoutTable[selectedCount] ? (Math.max(...payoutTable[selectedCount]) * bet).toLocaleString() : 0}</span>
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