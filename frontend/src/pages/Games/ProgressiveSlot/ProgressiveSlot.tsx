import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../services/authContext';
import { progressiveSlotService } from '../../../services/progressiveSlot.service';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const SYMBOLS = [
  { id: 1, emoji: '🍒', name: 'Cherry', multiplier: 2, rarity: 0.3 },
  { id: 2, emoji: '🍋', name: 'Lemon', multiplier: 3, rarity: 0.25 },
  { id: 3, emoji: '🔔', name: 'Bell', multiplier: 5, rarity: 0.2 },
  { id: 4, emoji: '💎', name: 'Diamond', multiplier: 10, rarity: 0.15 },
  { id: 5, emoji: '⭐', name: 'Star', multiplier: 15, rarity: 0.08 },
  { id: 6, emoji: '👑', name: 'Crown', multiplier: 25, rarity: 0.02 },
];

const SlotReel = ({ symbols, isSpinning, finalSymbol, spinDuration }:{ symbols: any, isSpinning: any, finalSymbol: any, reelIndex: any, spinDuration: any }) => {
  const [currentSymbol, setCurrentSymbol] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSpinning) return;
  
    intervalRef.current = setInterval(() => {
      setCurrentSymbol(prev => (prev + 1) % symbols.length);
    }, 100);
  
    const timeout = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCurrentSymbol(finalSymbol);
    }, spinDuration);
  
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(timeout);
    };
  }, [isSpinning, finalSymbol, spinDuration]);
  

  return (
    <div className="relative w-24 h-32 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg border-2 border-pink-500 overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-transparent"></div>
      <div className={`flex items-center justify-center h-full transition-all duration-300 ${isSpinning ? 'animate-bounce' : ''}`}>
        <div className="text-4xl drop-shadow-lg">
          {symbols[isSpinning ? currentSymbol : finalSymbol].emoji}
        </div>
      </div>
    </div>
  );
};

const PremiumSlotMachine = () => {
  const { token, balance, setBalance } = useAuth();
  const [bet, setBet] = useState(100);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelResults, setReelResults] = useState<number[]>([0, 0, 0, 0, 0]);
  const [lastWin, setLastWin] = useState(0);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const { t } = useTranslation();

  const spinReels = async () => {
    if (!token || isSpinning || balance < bet) return;
    setShowWinAnimation(false);

    setIsSpinning(true);
    try {
      const result: any = await progressiveSlotService.play(bet, token);
  
      const NUM_REELS = result.reelResults.length;

      setReelResults(Array(NUM_REELS).fill(0).map(() => Math.floor(Math.random() * SYMBOLS.length)));
  
      setTimeout(() => {
        const finalIndices = result.reelResults.map((id: number) => {
          const index = SYMBOLS.findIndex(s => s.id === id);
          return index >= 0 ? index : 0; 
        });  
  
        setReelResults(finalIndices);
  
        setLastWin(result.winAmount);
        setShowWinAnimation(result.winAmount > 0);
        setBalance(result.newBalance);
  
        setIsSpinning(false);
      }, 2000);
  
    } catch (err) {
      console.error("Slot API failed:", err);
      setIsSpinning(false);
    }
  };
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      
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
          WINNER SLOTS
        </motion.h1>
      </div>

      {/* Stats Bar */}
      <div className="max-w-6xl mx-auto mb-8 w-full">
        <div className="flex justify-center mb-6">
          <div className="flex gap-6 bg-black/30 rounded-xl p-4 border border-pink-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-500 flex items-center"><span className="material-symbols-outlined">poker_chip</span>{balance.toLocaleString()}</div>
              <div className="text-sm text-grey-300">{t("COINS")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="max-w-4xl mx-auto">
      {showWinAnimation && (<div className="text-3xl text-green-400 font-bold mt-2 flex items-center justify-center">
            +<span className="material-symbols-outlined">poker_chip</span>{lastWin.toLocaleString()}
          </div>)}
        {/* Slot Machine */}
        <div className="bg-gradient-to-br from-blue-900 via-pink-500 to-purple-800 rounded-3xl p-8 mb-8 border-4 border-pink-500 shadow-2xl">
          <div className="flex justify-center gap-4 mb-8">
          {reelResults?.map((symbolIndex: number, reelIndex: number) => (
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
                onClick={() => setBet(bet - 50)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                disabled={isSpinning}
              >
                -50
              </button>
              <div className="text-2xl font-bold text-yellow-400 flex items-center">
                <span className="material-symbols-outlined">poker_chip</span>{bet}
              </div>
              <button
                onClick={() => setBet(bet + 50)}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                disabled={isSpinning}
              >
                +50
              </button>
              <button
                onClick={()=>setBet(500)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                disabled={isSpinning}
              >
                {t("Max Bet")}
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
              {isSpinning ? '🎰 SPINNING...'  : '🎰 SPIN!'}
            </button>
          </div>
        </div>

        {/* Paytable */}
        <div className="bg-black/40 backdrop-blur-sm p-8 border border-pink-500/30 rounded-2xl p-6 border-2">
          <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-center">💰 {t("PAYTABLE")} 💰</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SYMBOLS.map(symbol => (
              <div key={symbol.id} className="border-2 border-pink-500/30 rounded-lg p-3 text-center">
                <div className="text-3xl mb-2">{symbol.emoji}</div>
                <div className="text-white font-bold">{symbol.name}</div>
                <div className="text-yellow-400 text-sm">{symbol.multiplier}x {t("bet")}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-gray-300 text-sm">
            {t("Match 3+ symbols on the payline to win! • 5 of a kind = 10x multiplier")}
          </div>
        </div>
      </div>
    </div>
  );
};


export default PremiumSlotMachine;