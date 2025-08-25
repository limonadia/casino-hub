import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Coins, Trophy, Volume2, VolumeX, Crown, Zap, Target, RefreshCw, Flame } from 'lucide-react';

interface Card {
  value: number; // 1-13
  suit: '♠' | '♥' | '♦' | '♣';
  color: 'red' | 'black';
}

interface GameStats {
  gamesPlayed: number;
  totalWinnings: number;
  bestStreak: number;
  winRate: number;
}

interface GameHistory {
  cardFrom: Card;
  cardTo: Card;
  guess: 'higher' | 'lower';
  won: boolean;
  payout: number;
  bet: number;
  streak: number;
}

const suits: Array<{ symbol: '♠' | '♥' | '♦' | '♣', color: 'red' | 'black' }> = [
  { symbol: '♠', color: 'black' },
  { symbol: '♥', color: 'red' },
  { symbol: '♦', color: 'red' },
  { symbol: '♣', color: 'black' }
];

const getRandomCard = (): Card => {
  const suit = suits[Math.floor(Math.random() * suits.length)];
  return {
    value: Math.floor(Math.random() * 13) + 1,
    suit: suit.symbol,
    color: suit.color
  };
};

const getCardName = (value: number): string => {
  if (value === 1) return 'A';
  if (value === 11) return 'J';
  if (value === 12) return 'Q';
  if (value === 13) return 'K';
  return value.toString();
};

const getCardOdds = (currentValue: number, guess: 'higher' | 'lower'): number => {
  if (guess === 'higher') {
    const cardsHigher = Math.max(0, 13 - currentValue);
    return cardsHigher / 12; // Excluding equal
  } else {
    const cardsLower = Math.max(0, currentValue - 1);
    return cardsLower / 12; // Excluding equal
  }
};

const CasinoHighLow = () => {
  const [balance, setBalance] = useState(50000);
  const [currentCard, setCurrentCard] = useState<Card>(getRandomCard());
  const [nextCard, setNextCard] = useState<Card | null>(null);
  const [bet, setBet] = useState(1000);
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState('Place your bet and guess if the next card will be higher or lower!');
  const [gameState, setGameState] = useState<'betting' | 'revealing' | 'complete'>('betting');
  const [confetti, setConfetti] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    totalWinnings: 0,
    bestStreak: 0,
    winRate: 0
  });
  const [cardAnimation, setCardAnimation] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [autoPlay, setAutoPlay] = useState(false);
  const [selectedGuess, setSelectedGuess] = useState<'higher' | 'lower' | null>(null);

  // Streak multiplier calculation
  useEffect(() => {
    const baseMultiplier = 1 + (streak * 0.1);
    setMultiplier(Math.min(baseMultiplier, 5)); // Cap at 5x
  }, [streak]);

  const playSound = (type: 'win' | 'lose' | 'click' | 'big_win') => {
    if (!soundEnabled) return;
    
    const frequency = type === 'win' ? 800 : type === 'big_win' ? 1000 : type === 'lose' ? 200 : 400;
    const audio = new Audio(`data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSMFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkfDShvxu3ajiwELHfK8uiTTAsRXrXs7aVTHwdOr+j3xHkrBzWO3v3EdMx7`);
    audio.volume = 0.1;
    audio.play().catch(() => {});
  };

  const calculatePayout = (betAmount: number, currentMultiplier: number, guess: 'higher' | 'lower'): number => {
    const odds = getCardOdds(currentCard.value, guess);
    const baseOdds = odds < 0.5 ? (1 / odds) - 1 : 1; // Better payouts for harder guesses
    return Math.floor(betAmount * baseOdds * currentMultiplier);
  };

  const makeGuess = async (guess: 'higher' | 'lower') => {
    if (balance < bet || gameState !== 'betting') return;
    
    setSelectedGuess(guess);
    setBalance(prev => prev - bet);
    setGameState('revealing');
    setCardAnimation(true);
    playSound('click');

    // Simulate card dealing animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const next = getRandomCard();
    setNextCard(next);
    setCardAnimation(false);

    // Determine win/loss
    let won = false;
    if (guess === 'higher' && next.value > currentCard.value) won = true;
    if (guess === 'lower' && next.value < currentCard.value) won = true;
    if (next.value === currentCard.value) won = false; // Ties lose

    await new Promise(resolve => setTimeout(resolve, 500));

    let payout = 0;
    let newStreak = streak;

    if (won) {
      payout = calculatePayout(bet, multiplier, guess);
      setBalance(prev => prev + bet + payout); // Return bet + winnings
      newStreak = streak + 1;
      setStreak(newStreak);
      
      if (payout >= bet * 3) {
        setMessage(`🔥 BIG WIN! +$${payout.toLocaleString()} (${multiplier.toFixed(1)}x Streak Bonus!)`);
        setConfetti(true);
        playSound('big_win');
        setTimeout(() => setConfetti(false), 4000);
      } else {
        setMessage(`✅ Winner! +$${payout.toLocaleString()} (Streak: ${newStreak})`);
        playSound('win');
      }
    } else {
      setMessage(`❌ Wrong! The card was ${next.value === currentCard.value ? 'equal' : guess === 'higher' ? 'lower' : 'higher'}. -$${bet.toLocaleString()}`);
      newStreak = 0;
      setStreak(0);
      playSound('lose');
    }

    // Update stats
    setStats(prev => ({
      gamesPlayed: prev.gamesPlayed + 1,
      totalWinnings: prev.totalWinnings + (won ? payout : -bet),
      bestStreak: Math.max(prev.bestStreak, newStreak),
      winRate: ((prev.gamesPlayed * prev.winRate + (won ? 100 : 0)) / (prev.gamesPlayed + 1))
    }));

    // Add to history
    setGameHistory(prev => [{
      cardFrom: currentCard,
      cardTo: next,
      guess,
      won,
      payout: won ? payout : -bet,
      bet,
      streak: newStreak
    }, ...prev.slice(0, 9)]);

    setGameState('complete');
  };

  const nextRound = () => {
    if (nextCard) {
      setCurrentCard(nextCard);
      setNextCard(null);
    } else {
      setCurrentCard(getRandomCard());
    }
    setGameState('betting');
    setSelectedGuess(null);
    setMessage('Place your bet and guess if the next card will be higher or lower!');
  };

  const resetGame = () => {
    setBalance(50000);
    setCurrentCard(getRandomCard());
    setNextCard(null);
    setStreak(0);
    setGameState('betting');
    setSelectedGuess(null);
    setStats({ gamesPlayed: 0, totalWinnings: 0, bestStreak: 0, winRate: 0 });
    setGameHistory([]);
    setMessage('Place your bet and guess if the next card will be higher or lower!');
  };

  const renderCard = (card: Card | null, isAnimating = false, isNext = false) => {
    if (!card && !isAnimating) return null;
    
    return (
      <div className={`relative transition-all duration-500 ${isAnimating ? 'animate-pulse scale-110' : ''}`}>
        <div className={`w-32 h-44 bg-white rounded-xl shadow-2xl border-2 border-gray-300 flex flex-col items-center justify-center ${
          isNext ? 'transform rotate-y-180' : ''
        }`}>
          {isAnimating && !card ? (
            <div className="text-4xl animate-spin">🎴</div>
          ) : card ? (
            <>
              <div className={`text-4xl font-bold ${card.color === 'red' ? 'text-red-500' : 'text-black'}`}>
                {getCardName(card.value)}
              </div>
              <div className={`text-6xl ${card.color === 'red' ? 'text-red-500' : 'text-black'}`}>
                {card.suit}
              </div>
              <div className={`text-sm font-bold ${card.color === 'red' ? 'text-red-500' : 'text-black'} mt-2`}>
                {card.value}
              </div>
            </>
          ) : null}
        </div>
        
        {/* Glow effect for special cards */}
        {card && (card.value === 1 || card.value >= 11) && (
          <div className="absolute inset-0 bg-yellow-400 rounded-xl opacity-20 animate-pulse" />
        )}
      </div>
    );
  };

  const getBetPresets = () => {
    const quarter = Math.floor(balance * 0.25);
    const half = Math.floor(balance * 0.5);
    const max = balance;
    return [1000, 5000, quarter, half, max].filter((v, i, arr) => arr.indexOf(v) === i && v <= balance);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 text-white">
      {/* Confetti Effect */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 200 }, (_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-yellow-400 animate-ping"
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
            <Target className="w-8 h-8 text-green-400 mr-2" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              HIGH-LOW ROYALE
            </h1>
            <Target className="w-8 h-8 text-green-400 ml-2" />
          </div>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center bg-green-900/30 px-4 py-2 rounded-lg">
              <Coins className="w-5 h-5 mr-2 text-green-400" />
              <span className="font-mono text-lg">${balance.toLocaleString()}</span>
            </div>
            <div className="flex items-center bg-orange-900/30 px-4 py-2 rounded-lg">
              <Flame className="w-5 h-5 mr-2 text-orange-400" />
              <span className="font-mono">Streak: {streak}</span>
            </div>
            <div className="flex items-center bg-purple-900/30 px-4 py-2 rounded-lg">
              <Zap className="w-5 h-5 mr-2 text-purple-400" />
              <span className="font-mono">{multiplier.toFixed(1)}x</span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Betting Controls */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
              <h3 className="font-bold mb-4 text-center text-green-400">Betting Controls</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Bet Amount</label>
                  <input
                    type="number"
                    value={bet}
                    onChange={(e) => setBet(Math.max(0, Math.min(balance, Number(e.target.value))))}
                    disabled={gameState !== 'betting'}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                    min="0"
                    max={balance}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {getBetPresets().map(preset => (
                    <button
                      key={preset}
                      onClick={() => setBet(preset)}
                      disabled={gameState !== 'betting'}
                      className="px-3 py-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm font-semibold transition-colors"
                    >
                      ${preset >= 1000 ? `${(preset / 1000).toFixed(0)}K` : preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Odds */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
              <h3 className="font-bold mb-3 text-center text-green-400">Card Odds</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Current Card:</span>
                  <span className="font-bold">{getCardName(currentCard.value)} {currentCard.suit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Higher Odds:</span>
                  <span className={`font-bold ${getCardOdds(currentCard.value, 'higher') > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                    {(getCardOdds(currentCard.value, 'higher') * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lower Odds:</span>
                  <span className={`font-bold ${getCardOdds(currentCard.value, 'lower') > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                    {(getCardOdds(currentCard.value, 'lower') * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span>Potential Win (Higher):</span>
                    <span className="text-green-400 font-bold">
                      ${calculatePayout(bet, multiplier, 'higher').toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Potential Win (Lower):</span>
                    <span className="text-green-400 font-bold">
                      ${calculatePayout(bet, multiplier, 'lower').toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
              <h3 className="font-bold mb-3 text-center text-green-400">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Games Played:</span>
                  <span>{stats.gamesPlayed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Win Rate:</span>
                  <span className="text-yellow-400">{stats.winRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Streak:</span>
                  <span className="text-orange-400">{stats.bestStreak}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total P&L:</span>
                  <span className={stats.totalWinnings >= 0 ? 'text-green-400' : 'text-red-400'}>
                    ${stats.totalWinnings.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Game History */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
              <h3 className="font-bold mb-3 text-center text-green-400">Recent Games</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {gameHistory.map((game, index) => (
                  <div key={index} className="text-xs bg-gray-800/50 p-2 rounded">
                    <div className="flex justify-between items-center">
                      <span>
                        {getCardName(game.cardFrom.value)} → {getCardName(game.cardTo.value)}
                      </span>
                      <span className={game.won ? 'text-green-400' : 'text-red-400'}>
                        {game.won ? '+' : ''}${game.payout.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-gray-400 flex justify-between">
                      <span>{game.guess.toUpperCase()}</span>
                      <span>Streak: {game.streak}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-3">
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 border border-green-500/30">
              {/* Game Message */}
              <div className="text-center mb-8">
                <p className="text-xl font-semibold text-green-300">{message}</p>
              </div>

              {/* Cards Display */}
              <div className="flex justify-center items-center space-x-8 mb-8">
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-4 text-green-400">Current Card</h3>
                  {renderCard(currentCard)}
                </div>
                
                <div className="text-6xl text-green-400 animate-pulse">VS</div>
                
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-4 text-green-400">Next Card</h3>
                  {gameState === 'revealing' ? (
                    renderCard(null, true)
                  ) : nextCard ? (
                    renderCard(nextCard)
                  ) : (
                    <div className="w-32 h-44 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">?</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Game Controls */}
              <div className="flex justify-center space-x-6 mb-6">
                {gameState === 'betting' ? (
                  <>
                    <button
                      onClick={() => makeGuess('higher')}
                      disabled={balance < bet || bet <= 0}
                      className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-xl shadow-lg transition-all transform hover:scale-105 flex items-center"
                    >
                      <TrendingUp className="w-6 h-6 mr-2" />
                      HIGHER
                    </button>
                    <button
                      onClick={() => makeGuess('lower')}
                      disabled={balance < bet || bet <= 0}
                      className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-xl shadow-lg transition-all transform hover:scale-105 flex items-center"
                    >
                      <TrendingDown className="w-6 h-6 mr-2" />
                      LOWER
                    </button>
                  </>
                ) : gameState === 'complete' ? (
                  <button
                    onClick={nextRound}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-bold text-xl shadow-lg transition-all transform hover:scale-105 flex items-center"
                  >
                    <RefreshCw className="w-6 h-6 mr-2" />
                    NEXT ROUND
                  </button>
                ) : (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-yellow-400 animate-pulse">
                      Dealing card...
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Controls */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetGame}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition-colors"
                >
                  Reset Game
                </button>
                {balance === 0 && (
                  <button
                    onClick={() => setBalance(10000)}
                    className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 rounded font-semibold transition-colors"
                  >
                    Add Credits
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasinoHighLow;