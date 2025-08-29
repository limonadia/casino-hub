import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { slotService } from '../../../services/slotService';
import { userService } from '../../../services/userService';
import { useAuth } from '../../../services/authContext';

const SlotMachine = () => {
  const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
  const [spinning, setSpinning] = useState(false);
  const [coins, setCoins] = useState(0);
  const [bet, setBet] = useState(50);
  const [winAmount, setWinAmount] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [reelStops, setReelStops] = useState([false, false, false]);
  const { setBalance } = useAuth();

  const playSound = (type: string) => {
    console.log(`Playing ${type} sound`);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userService.getProfile();
        setCoins(profile.balance);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const symbolsMap = ["🍒","🍋","🍊","🍇","🔔","⭐","💎","7️⃣","👑"];

  const spin = async () => {
    if (spinning || coins < bet) return;
    setSpinning(true);
    setShowWin(false);
    setWinAmount(0);
    setReelStops([false, false, false]); 
  
    try {
      const result = await slotService.spin({ betAmount: bet });
      const reelEmojis = result.symbols.map(idx => symbolsMap[idx]);
  
      reelEmojis.forEach((emoji, i) => {
        setTimeout(() => {
          setReels(prev => {
            const updated = [...prev];
            updated[i] = emoji;
            return updated;
          });
          setReelStops(prev => {
            const updated = [...prev];
            updated[i] = true;
            return updated;
          });
        }, i * 600); 
      });
  
      setTimeout(() => {
        setCoins(result.newBalance);
        setBalance(result.newBalance);
        setWinAmount(result.winAmount);
        setShowWin(result.winAmount > 0);
        playSound(result.winAmount > 0 ? "win" : "spin");
        setSpinning(false);
      }, reelEmojis.length * 600 + 200);
  
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Spin failed");
      setSpinning(false);
    }
  };
  
  const maxBet = () => {
    setBet(Math.min(500, coins));
  };

  const minBet = () => {
    setBet(Math.min(50, coins));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-pink-500 to-pink-900 flex flex-col items-center justify-center w-full p-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffd700' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
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
      </div>

      <div className="relative">
        <div className="bg-gradient-to-b from-gray-800 via-gray-700 to-gray-900 rounded-3xl p-8 shadow-2xl border-8 border-yellow-400 relative overflow-hidden">
          <div className="absolute top-4 left-4 right-4 h-2 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 rounded-full opacity-80"></div>
          <div className="absolute bottom-4 left-4 right-4 h-2 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 rounded-full opacity-80"></div>
          
          <div className="bg-black rounded-2xl p-6 mb-6 border-4 border-yellow-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl"></div>

            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              {reels.map((symbol, index) => (
                <div key={index} className="relative">
                  <div className="w-[20vw] max-w-24 h-[25vw] max-h-32 sm:w-24 sm:h-32 bg-gradient-to-b from-white via-gray-100 to-white rounded-xl border-4 border-gray-400 shadow-inner overflow-hidden relative">
                    {spinning && !reelStops[index] && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent"
                        animate={{ y: [-100, 100] }}
                        transition={{ duration: 0.1, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                    <motion.div
                      className="w-full h-full flex items-center justify-center text-[8vw] sm:text-5xl relative z-10"
                      animate={
                        spinning && !reelStops[index]
                          ? { y: [0, -20, 0, 20, 0], rotate: [0, 5, 0, -5, 0] }
                          : {
                              y: 0,
                              rotate: 0,
                              scale:
                                showWin && reels.every((s) => s === symbol)
                                  ? [1, 1.2, 1]
                                  : 1,
                            }
                      }
                      transition={{
                        duration: spinning && !reelStops[index] ? 0.1 : 0.5,
                        repeat: spinning && !reelStops[index] ? Infinity : showWin ? 3 : 0,
                        ease: "easeInOut",
                      }}
                    >
                      {symbol}
                    </motion.div>

                    {showWin && reels.every((s) => s === symbol) && (
                      <motion.div
                        className="absolute inset-3 border-4 border-yellow-400 rounded-xl"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      />
                    )}
                  </div>

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

          <div className="grid grid-cols-2 gap-4 mb-6 text-center">
            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4 border-2 border-green-400">
              <div className="text-green-200 text-sm font-semibold">COINS</div>
              <div className="text-2xl font-bold text-white flex items-center"><span className="material-symbols-outlined">poker_chip</span>{coins.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 border-2 border-blue-400">
              <div className="text-blue-200 text-sm font-semibold">BET</div>
              <div className="text-2xl font-bold text-white flex items-center justify-center"><span className="material-symbols-outlined">poker_chip</span>{bet}</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center mb-4">
          <button onClick={minBet}  disabled={spinning} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-bold rounded-lg border-2 border-purple-400  disabled:opacity-50 shadow-lg">
              MIN BET
            </button>
            <button onClick={() => setBet(Math.max(10, bet - 10))} disabled={spinning} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold rounded-lg border-2 border-red-400 hover:from-red-400 hover:to-red-600 disabled:opacity-50 shadow-lg">
              BET -
            </button>
            <button onClick={() => setBet(Math.min(500, coins, bet + 10))} disabled={spinning} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-lg border-2 border-blue-400 hover:from-blue-400 hover:to-blue-600 disabled:opacity-50 transition-all shadow-lg">
              BET +
            </button>
            <button onClick={maxBet} disabled={spinning} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold rounded-lg border-2 border-purple-400 hover:from-purple-400 hover:to-purple-600 disabled:opacity-50 transition-all shadow-lg">
              MAX BET
            </button>
          </div>

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
              
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 rounded-2xl"
                animate={{ x: [-100, 300] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.button>
          </div>

          {showWin && (<div className="text-3xl text-green-400 font-bold mt-2 flex items-center">
            +<span className="material-symbols-outlined">poker_chip</span>{winAmount.toLocaleString()} COINS!
          </div>)}

          {coins < bet && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-4 text-red-400 font-bold"
            >
              ⚠️ Insufficient coins!
            </motion.div>
          )}
        </div>
        <div className="absolute -left-4 top-1/4 bottom-1/4 w-8 bg-gradient-to-b from-red-500 via-yellow-500 to-red-500 rounded-full opacity-80 animate-pulse"></div>
        <div className="absolute -right-4 top-1/4 bottom-1/4 w-8 bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 rounded-full opacity-80 animate-pulse"></div>
      </div>
    </div>
  );
};

export default SlotMachine;