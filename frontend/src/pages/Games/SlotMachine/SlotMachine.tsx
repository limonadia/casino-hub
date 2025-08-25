import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const symbols = [
  { symbol: '🍒', name: 'Cherry', payout: 50, rarity: 0.25 },
  { symbol: '🍋', name: 'Lemon', payout: 75, rarity: 0.2 },
  { symbol: '🍊', name: 'Orange', payout: 100, rarity: 0.15 },
  { symbol: '🍇', name: 'Grapes', payout: 150, rarity: 0.12 },
  { symbol: '🔔', name: 'Bell', payout: 200, rarity: 0.1 },
  { symbol: '⭐', name: 'Star', payout: 300, rarity: 0.08 },
  { symbol: '💎', name: 'Diamond', payout: 500, rarity: 0.05 },
  { symbol: '7️⃣', name: 'Lucky 7', payout: 1000, rarity: 0.03 },
  { symbol: '👑', name: 'Crown', payout: 2500, rarity: 0.02 }
];

const getWeightedRandomSymbol = () => {
  const random = Math.random();
  let cumulative = 0;
  
  for (const sym of symbols) {
    cumulative += sym.rarity;
    if (random <= cumulative) {
      return sym.symbol;
    }
  }
  return symbols[0].symbol;
};

const SlotMachine = () => {
  const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
  const [spinning, setSpinning] = useState(false);
  const [coins, setCoins] = useState(5000);
  const [bet, setBet] = useState(50);
  const [winAmount, setWinAmount] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [jackpotAmount, setJackpotAmount] = useState(50000);
  const [reelStops, setReelStops] = useState([false, false, false]);
  
  const playSound = (type: string) => {
    console.log(`Playing ${type} sound`);
  };

  const checkWin = (finalReels: any[]) => {
    const first = finalReels[0];
    const allSame = finalReels.every((symbol: any) => symbol === first);
    
    if (allSame) {
      const symbolData = symbols.find(s => s.symbol === first);
      let winnings = symbolData ? symbolData.payout : 0;
      
      if (first === '👑') {
        winnings = jackpotAmount;
        setJackpotAmount(50000); 
      }
      
      return winnings;
    }
    
    // Check for two matching symbols (smaller payout)
    const matches = finalReels.filter((symbol: any) => symbol === first).length;
    if (matches === 2) {
      const symbolData = symbols.find(s => s.symbol === first);
      return symbolData ? Math.floor(symbolData.payout * 0.3) : 0;
    }
    
    return 0;
  };

  const spin = () => {
    if (spinning || coins < bet) return;
    
    setCoins(prev => prev - bet);
    setSpinning(true);
    setWinAmount(0);
    setShowWin(false);
    setReelStops([false, false, false]);
    setSpinCount(prev => prev + 1);
    
    // Increase jackpot slightly with each spin
    setJackpotAmount(prev => prev + Math.floor(bet * 0.1));
    
    playSound('spin');
    
    const finalReels = [
      getWeightedRandomSymbol(),
      getWeightedRandomSymbol(),
      getWeightedRandomSymbol()
    ];
    
    // Stagger reel stops for realism
    setTimeout(() => setReelStops([true, false, false]), 1000);
    setTimeout(() => setReelStops([true, true, false]), 1500);
    setTimeout(() => {
      setReelStops([true, true, true]);
      setReels(finalReels);
      setSpinning(false);
      
      const winnings = checkWin(finalReels);
      if (winnings > 0) {
        setWinAmount(winnings);
        setCoins(prev => prev + winnings);
        setShowWin(true);
        playSound('win');
        setTimeout(() => setShowWin(false), 3000);
      }
    }, 2000);
  };

  const maxBet = () => {
    setBet(Math.min(500, coins));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-red-900 to-yellow-900 flex flex-col items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffd700' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <motion.h1 
          className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 mb-2"
          animate={{ 
            textShadow: [
              "0 0 20px #ffd700",
              "0 0 40px #ffd700, 0 0 60px #ff6b6b",
              "0 0 20px #ffd700"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          ROYAL SLOTS
        </motion.h1>
        <div className="text-2xl text-yellow-300 font-semibold">
          💰 JACKPOT: {jackpotAmount.toLocaleString()} COINS 💰
        </div>
      </div>

      {/* Win Animation */}
      <AnimatePresence>
        {showWin && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-1/4 z-50 text-center"
          >
            <div className="text-8xl font-bold text-yellow-400 animate-pulse">
              🎉 WIN! 🎉
            </div>
            <div className="text-4xl text-green-400 font-bold mt-4">
              +{winAmount.toLocaleString()} COINS!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slot Machine Frame */}
      <div className="relative">
        {/* Machine Body */}
        <div className="bg-gradient-to-b from-gray-800 via-gray-700 to-gray-900 rounded-3xl p-8 shadow-2xl border-8 border-yellow-400 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 right-4 h-2 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 rounded-full opacity-80"></div>
          <div className="absolute bottom-4 left-4 right-4 h-2 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 rounded-full opacity-80"></div>
          
          {/* Display Screen */}
          <div className="bg-black rounded-2xl p-6 mb-6 border-4 border-yellow-500 relative overflow-hidden">
            {/* Screen glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl"></div>
            
            {/* Reels */}
            <div className="flex justify-center gap-4 relative z-10">
              {reels.map((symbol, index) => (
                <div key={index} className="relative">
                  {/* Reel Background */}
                  <div className="w-24 h-32 bg-gradient-to-b from-white via-gray-100 to-white rounded-xl border-4 border-gray-400 shadow-inner overflow-hidden relative">
                    {/* Reel spinning effect */}
                    {spinning && !reelStops[index] && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent"
                        animate={{ y: [-100, 100] }}
                        transition={{ duration: 0.1, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                    
                    {/* Symbol */}
                    <motion.div
                      className="w-full h-full flex items-center justify-center text-5xl relative z-10"
                      animate={spinning && !reelStops[index] ? {
                        y: [0, -20, 0, 20, 0],
                        rotate: [0, 5, 0, -5, 0]
                      } : {
                        scale: showWin && reels.every(s => s === symbol) ? [1, 1.2, 1] : 1
                      }}
                      transition={{
                        duration: spinning && !reelStops[index] ? 0.1 : 0.5,
                        repeat: spinning && !reelStops[index] ? Infinity : showWin ? 3 : 0,
                        ease: "easeInOut"
                      }}
                    >
                      {symbol}
                    </motion.div>
                    
                    {/* Win highlight */}
                    {showWin && reels.every(s => s === symbol) && (
                      <motion.div
                        className="absolute inset-0 border-4 border-yellow-400 rounded-xl"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      />
                    )}
                  </div>
                  
                  {/* Reel stopped indicator */}
                  {spinning && reelStops[index] && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    >
                      ✓
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info Display */}
          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4 border-2 border-green-400">
              <div className="text-green-200 text-sm font-semibold">COINS</div>
              <div className="text-2xl font-bold text-white">{coins.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 border-2 border-blue-400">
              <div className="text-blue-200 text-sm font-semibold">BET</div>
              <div className="text-2xl font-bold text-white">{bet}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-4 border-2 border-purple-400">
              <div className="text-purple-200 text-sm font-semibold">SPINS</div>
              <div className="text-2xl font-bold text-white">{spinCount}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center mb-4">
            <button
              onClick={() => setBet(Math.max(10, bet - 10))}
              disabled={spinning}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold rounded-lg border-2 border-red-400 hover:from-red-400 hover:to-red-600 disabled:opacity-50 transition-all shadow-lg"
            >
              BET -
            </button>
            <button
              onClick={() => setBet(Math.min(500, coins, bet + 10))}
              disabled={spinning}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-lg border-2 border-blue-400 hover:from-blue-400 hover:to-blue-600 disabled:opacity-50 transition-all shadow-lg"
            >
              BET +
            </button>
            <button
              onClick={maxBet}
              disabled={spinning}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold rounded-lg border-2 border-purple-400 hover:from-purple-400 hover:to-purple-600 disabled:opacity-50 transition-all shadow-lg"
            >
              MAX BET
            </button>
          </div>

          {/* Spin Button */}
          <div className="flex justify-center">
            <motion.button
              onClick={spin}
              disabled={spinning || coins < bet}
              className="px-12 py-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-bold text-2xl rounded-2xl border-4 border-yellow-300 shadow-2xl relative overflow-hidden"
              whileHover={{ scale: spinning ? 1 : 1.05 }}
              whileTap={{ scale: spinning ? 1 : 0.95 }}
              animate={spinning ? {
                boxShadow: [
                  "0 0 20px #ffd700",
                  "0 0 40px #ffd700, 0 0 60px #ffed4e",
                  "0 0 20px #ffd700"
                ]
              } : {}}
              transition={{ duration: 0.5, repeat: spinning ? Infinity : 0 }}
            >
              {spinning ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  ⚡
                </motion.div>
              ) : (
                "🎰 SPIN 🎰"
              )}
              
              {/* Button glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 rounded-2xl"
                animate={{ x: [-100, 300] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.button>
          </div>

          {/* Insufficient funds warning */}
          {coins < bet && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-4 text-red-400 font-bold"
            >
              ⚠️ Insufficient coins! Lower your bet or add more coins!
            </motion.div>
          )}
        </div>

        {/* Side Lights */}
        <div className="absolute -left-4 top-1/4 bottom-1/4 w-8 bg-gradient-to-b from-red-500 via-yellow-500 to-red-500 rounded-full opacity-80 animate-pulse"></div>
        <div className="absolute -right-4 top-1/4 bottom-1/4 w-8 bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 rounded-full opacity-80 animate-pulse"></div>
      </div>

      {/* Paytable */}
      <div className="mt-8 bg-black/50 rounded-2xl p-6 border-2 border-yellow-400 max-w-4xl">
        <h3 className="text-2xl font-bold text-yellow-400 text-center mb-4">PAYTABLE</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          {symbols.slice().reverse().map((sym) => (
            <div key={sym.symbol} className="flex items-center justify-between text-white">
              <span className="text-2xl">{sym.symbol}</span>
              <span className="text-yellow-300 font-semibold">{sym.payout.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;