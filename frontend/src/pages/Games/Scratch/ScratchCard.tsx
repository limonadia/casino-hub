import React, { useRef, useEffect, useState } from 'react';
import { Coins, Gift, Trophy, Volume2, VolumeX, Sparkles, RefreshCw, Crown, Star, Zap } from 'lucide-react';

interface ScratchCard {
  id: number;
  name: string;
  cost: number;
  maxPrize: number;
  color: string;
  icon: React.ReactNode;
  prizes: number[];
  winChance: number;
  theme: string;
}

interface GameHistoryEntry {
  cardName: string;
  cost: number;
  prize: number;
  profit: number;
  timestamp: string;
}

const scratchCards: ScratchCard[] = [
  {
    id: 1,
    name: "Lucky 7s",
    cost: 100,
    maxPrize: 5000,
    color: "from-red-600 to-red-800",
    icon: <Star className="w-6 h-6" />,
    prizes: [0, 0, 0, 0, 100, 200, 500, 1000, 5000],
    winChance: 0.4,
    theme: "classic"
  },
  {
    id: 2,
    name: "Diamond Rush",
    cost: 250,
    maxPrize: 15000,
    color: "from-blue-600 to-purple-800",
    icon: <Sparkles className="w-6 h-6" />,
    prizes: [0, 0, 0, 250, 500, 1000, 2500, 7500, 15000],
    winChance: 0.35,
    theme: "luxury"
  },
  {
    id: 3,
    name: "Gold Rush",
    cost: 500,
    maxPrize: 50000,
    color: "from-yellow-600 to-orange-800",
    icon: <Crown className="w-6 h-6" />,
    prizes: [0, 0, 0, 500, 1000, 2500, 10000, 25000, 50000],
    winChance: 0.3,
    theme: "premium"
  },
  {
    id: 4,
    name: "Mega Millions",
    cost: 1000,
    maxPrize: 100000,
    color: "from-green-600 to-teal-800",
    icon: <Zap className="w-6 h-6" />,
    prizes: [0, 0, 1000, 2000, 5000, 10000, 25000, 50000, 100000],
    winChance: 0.25,
    theme: "elite"
  }
];

const ScratchCardGame = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [balance, setBalance] = useState(25000);
  const [selectedCard, setSelectedCard] = useState<ScratchCard>(scratchCards[0]);
  const [currentPrize, setCurrentPrize] = useState<number>(0);
  const [revealedPrize, setRevealedPrize] = useState<number | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [cardPurchased, setCardPurchased] = useState(false);
  const [autoReveal, setAutoReveal] = useState(false);
  const [totalScratched, setTotalScratched] = useState(0);
  const [totalWon, setTotalWon] = useState(0);

  const cardWidth = 350;
  const cardHeight = 250;

  // Initialize scratch canvas
  useEffect(() => {
    if (!cardPurchased) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create scratch surface with gradient
    const gradient = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
    gradient.addColorStop(0, '#c0c0c0');
    gradient.addColorStop(0.5, '#808080');
    gradient.addColorStop(1, '#404040');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, cardWidth, cardHeight);
    
    // Add scratch texture
    ctx.fillStyle = '#999';
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * cardWidth;
      const y = Math.random() * cardHeight;
      ctx.fillRect(x, y, 1, 1);
    }
    
    // Set composite operation for scratching
    ctx.globalCompositeOperation = 'destination-out';
  }, [cardKey, cardPurchased]);

  const generatePrize = () => {
    const card = selectedCard;
    const random = Math.random();
    
    if (random < card.winChance) {
      // Winner - select from non-zero prizes
      const winningPrizes = card.prizes.filter(p => p > 0);
      const prizeIndex = Math.floor(Math.random() * winningPrizes.length);
      return winningPrizes[prizeIndex];
    } else {
      // Loser
      return 0;
    }
  };

  const purchaseCard = () => {
    if (balance < selectedCard.cost) return;
    
    setBalance(prev => prev - selectedCard.cost);
    setCurrentPrize(generatePrize());
    setRevealedPrize(null);
    setScratchProgress(0);
    setCardPurchased(true);
    setCardKey(prev => prev + 1);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!cardPurchased || revealedPrize !== null) return;
    setIsScratching(true);
    scratch(e);
  };

  const handlePointerUp = () => {
    setIsScratching(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScratching || !cardPurchased) return;
    scratch(e);
  };

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Scratch effect
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Play scratch sound
    if (soundEnabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSMFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkfDShvxu3ajiwELHfK8uiTTAsRXrXs7aVTHwdOr+j3xHkrBzWO3v3EdMx7');
      audio.volume = 0.1;
      audio.play().catch(() => {});
    }

    checkReveal();
  };

  const checkReveal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, cardWidth, cardHeight);
    let clearedPixels = 0;
    
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) clearedPixels++;
    }
    
    const progress = clearedPixels / (cardWidth * cardHeight);
    setScratchProgress(progress);
    
    if (progress > 0.3 && revealedPrize === null) {
      revealPrize();
    }
  };

  const revealPrize = () => {
    setRevealedPrize(currentPrize);
    setBalance(prev => prev + currentPrize);
    setTotalScratched(prev => prev + 1);
    setTotalWon(prev => prev + currentPrize);
    
    // Add to history
    setGameHistory(prev => [{
      cardName: selectedCard.name,
      cost: selectedCard.cost,
      prize: currentPrize,
      profit: currentPrize - selectedCard.cost,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev.slice(0, 9)]);

    if (currentPrize > selectedCard.cost * 5) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4000);
      
      if (soundEnabled) {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSMFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkfDShvxu3ajiwELHfK8uiTTAsRXrXs7aVTHwdOr+j3xHkrBzWO3v3EdMx7');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }
    }
  };

  const autoRevealCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, cardWidth, cardHeight);
    revealPrize();
  };

  const newCard = () => {
    setCardPurchased(false);
    setRevealedPrize(null);
    setScratchProgress(0);
    setCurrentPrize(0);
  };

  const renderPrizeDisplay = () => {
    if (!cardPurchased) return null;
    
    const symbols = selectedCard.theme === 'classic' ? ['🎰', '💎', '🍀'] :
                   selectedCard.theme === 'luxury' ? ['💎', '👑', '⭐'] :
                   selectedCard.theme === 'premium' ? ['🏆', '💰', '🎯'] :
                   ['🚀', '⚡', '🌟'];
    
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center space-x-4 mb-4">
            {symbols.map((symbol, i) => (
              <div key={i} className="text-4xl animate-pulse">
                {symbol}
              </div>
            ))}
          </div>
          {revealedPrize !== null ? (
            <div className={`text-4xl font-bold ${currentPrize > 0 ? 'text-green-400' : 'text-red-400'} animate-bounce`}>
              {currentPrize > 0 ? `$${currentPrize.toLocaleString()}` : 'BETTER LUCK NEXT TIME'}
            </div>
          ) : (
            <div className="text-2xl font-bold text-yellow-400">
              SCRATCH TO REVEAL
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      {/* Confetti Effect */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 150 }, (_, i) => (
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Gift className="w-8 h-8 text-pink-400 mr-2" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              SCRATCH ROYALE
            </h1>
            <Gift className="w-8 h-8 text-pink-400 ml-2" />
          </div>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center bg-green-900/30 px-3 py-1 rounded">
              <Coins className="w-4 h-4 mr-1 text-green-400" />
              <span className="font-mono">${balance.toLocaleString()}</span>
            </div>
            <div className="flex items-center bg-blue-900/30 px-3 py-1 rounded">
              <Trophy className="w-4 h-4 mr-1 text-blue-400" />
              <span className="font-mono">{totalScratched} Cards</span>
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
          {/* Card Selection */}
          <div className="lg:col-span-1">
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 mb-4">
              <h3 className="font-bold mb-4 text-center">Choose Your Card</h3>
              <div className="space-y-3">
                {scratchCards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    disabled={cardPurchased}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      selectedCard.id === card.id
                        ? 'border-purple-400 bg-purple-900/50'
                        : 'border-gray-600 bg-gray-800/30 hover:border-purple-500'
                    } ${cardPurchased ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {card.icon}
                        <span className="ml-2 font-semibold text-sm">{card.name}</span>
                      </div>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Cost:</span>
                        <span className="text-red-400">${card.cost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Prize:</span>
                        <span className="text-green-400">${card.maxPrize.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Win Chance:</span>
                        <span className="text-yellow-400">{(card.winChance * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 mb-4">
              <h3 className="font-bold mb-3 text-center">Statistics</h3>
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span>Total Scratched:</span>
                  <span>{totalScratched}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Won:</span>
                  <span className="text-green-400">${totalWon.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Win Rate:</span>
                  <span className="text-yellow-400">
                    {totalScratched > 0 ? ((gameHistory.filter(g => g.prize > 0).length / totalScratched) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Game History */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
              <h3 className="font-bold mb-3 text-center">Recent Games</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {gameHistory.map((game, index) => (
                  <div key={index} className="text-xs bg-gray-800/50 p-2 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{game.cardName}</span>
                      <span className={game.profit > 0 ? 'text-green-400' : 'text-red-400'}>
                        {game.profit > 0 ? '+' : ''}${game.profit.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-gray-400 flex justify-between">
                      <span>${game.prize.toLocaleString()} won</span>
                      <span>{game.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-3">
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{selectedCard.name}</h2>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <span>Cost: <span className="text-red-400">${selectedCard.cost}</span></span>
                  <span>Max Prize: <span className="text-green-400">${selectedCard.maxPrize.toLocaleString()}</span></span>
                  <span>Win Chance: <span className="text-yellow-400">{(selectedCard.winChance * 100).toFixed(0)}%</span></span>
                </div>
              </div>

              {/* Scratch Card */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className={`w-[${cardWidth}px] h-[${cardHeight}px] bg-gradient-to-br ${selectedCard.color} rounded-lg shadow-2xl border-4 border-gold-400`}>
                    {renderPrizeDisplay()}
                  </div>
                  {cardPurchased && (
                    <canvas
                      ref={canvasRef}
                      width={cardWidth}
                      height={cardHeight}
                      className="absolute inset-0 rounded-lg cursor-crosshair"
                      style={{ touchAction: 'none' }}
                      onPointerDown={handlePointerDown}
                      onPointerUp={handlePointerUp}
                      onPointerMove={handlePointerMove}
                      onPointerLeave={handlePointerUp}
                    />
                  )}
                  {scratchProgress > 0 && scratchProgress < 1 && (
                    <div className="absolute -bottom-8 left-0 right-0">
                      <div className="bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(scratchProgress * 100).toFixed(0)}%` }}
                        />
                      </div>
                      <div className="text-center text-xs mt-1 text-gray-400">
                        {(scratchProgress * 100).toFixed(0)}% Revealed
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Game Controls */}
              <div className="flex justify-center space-x-4">
                {!cardPurchased ? (
                  <button
                    onClick={purchaseCard}
                    disabled={balance < selectedCard.cost}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105"
                  >
                    Buy Card (${selectedCard.cost})
                  </button>
                ) : (
                  <div className="space-x-3">
                    {revealedPrize === null && (
                      <button
                        onClick={autoRevealCard}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded font-semibold transition-colors"
                      >
                        <RefreshCw className="w-4 h-4 inline mr-1" />
                        Auto Reveal
                      </button>
                    )}
                    {revealedPrize !== null && (
                      <button
                        onClick={newCard}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105"
                      >
                        New Card
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Prize Message */}
              {revealedPrize !== null && (
                <div className="text-center mt-6">
                  <div className={`text-2xl font-bold ${currentPrize > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {currentPrize > 0 
                      ? `🎉 Congratulations! You won $${currentPrize.toLocaleString()}!`
                      : '😔 Better luck next time!'
                    }
                  </div>
                  {currentPrize > selectedCard.cost * 5 && (
                    <div className="text-yellow-400 font-bold text-lg mt-2 animate-pulse">
                      🔥 BIG WIN! 🔥
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScratchCardGame;