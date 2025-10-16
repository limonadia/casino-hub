import { useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Equal } from 'lucide-react';
import { hiloService } from '../../../services/hiLoService';
import { motion } from 'framer-motion';
import { useAuth } from '../../../services/authContext';
import { useTranslation } from 'react-i18next';

interface Card {
  value: number; 
  suit: '♠' | '♥' | '♦' | '♣';
  color: 'red' | 'black';
}

interface GameHistory {
  cardFrom: Card;
  cardTo: Card;
  guess: 'higher' | 'lower'| 'tie';
  won: boolean;
  payout: number;
  bet: number;
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

const CasinoHighLow = () => {
  const { t } = useTranslation();
  const [currentCard, setCurrentCard] = useState<Card>(getRandomCard());
  const [nextCard, setNextCard] = useState<Card | null>(null);
  const [bet, setBet] = useState(100);
  const [message, setMessage] = useState(t('Place your bet and guess if the next card will be higher or lower!'));
  const [gameState, setGameState] = useState<'betting' | 'revealing' | 'complete'>('betting');
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const { balance, setBalance } = useAuth(); 

  const makeGuess = async (guess: 'higher' | 'lower' | 'tie') => {
    try {
      const res: any = await hiloService.play(guess, bet);
      setBalance(res.balance);
      setMessage(res.message);
      setCurrentCard(res.cardFrom);
      setNextCard(res.cardTo);
  
      setGameHistory(prev => [{
        cardFrom: res.cardFrom,
        cardTo: res.cardTo,
        guess,
        won: res.won,
        payout: res.payout,
        bet
      }, ...prev.slice(0, 9)]);
      
      setGameState('complete');
    } catch (err) {
      console.error(err);
      setMessage("Error playing game");
    }
  };
  
  const nextRound = () => {
    if (nextCard) {
      setCurrentCard(nextCard);
      setNextCard(null);
    } else {
      setCurrentCard(getRandomCard());
    }
    setGameState('betting');
    setMessage(t('Place your bet and guess if the next card will be higher, lower, or tie!'));
  };

  const resetGame = () => {
    setBalance(50000);
    setCurrentCard(getRandomCard());
    setNextCard(null);
    setGameState('betting');
    setGameHistory([]);
    setMessage(t('Place your bet and guess if the next card will be higher, lower, or tie!'));
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
      </div>
    );
  };

  const getBetPresets = () => {
    const quarter = 10;
    const half = 25;
    const max = 50;
    const other1 = 100;
    const other2 = 500;
    return [quarter, half, max, other1, other2];
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-900 via-teal-900 to-purple-900 text-white">

      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <motion.h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-pink-500 to-purple-800 mb-2"
              animate={{ 
                textShadow: [
                  "0 0 20px pink",
                  "0 0 40px purple, 0 0 60px violet",
                  "0 0 20px blue"
                ]
              }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <span className='flex items-center justify-center gap-3'>
                  HIGH-LOW ROYALE
                </span>
            </motion.h1>
          </div>

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Betting Controls */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-pink-500/30">
              <h3 className="font-bold mb-4 text-center text-pink-400">{t("Betting Controls")}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">{t("Bet Amount")}</label>
                  <input
                    type="number"
                    value={bet}
                    onChange={(e) => setBet(Math.max(0, Math.min(balance, Number(e.target.value))))}
                    disabled={gameState !== 'betting'}
                    className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white"
                    min="0"
                    max={balance}/>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {getBetPresets().map(preset => (
                    <button
                      key={preset}
                      onClick={() => setBet(preset)}
                      disabled={gameState !== 'betting'}
                      className="w-auto flex justify-center items-center bg-green-700 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm font-semibold transition-colors">
                        <span className="material-symbols-outlined">poker_chip</span> {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Game History */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-pink-500/30">
              <h3 className="font-bold mb-3 text-center text-pink-400">{t("Recent Games")}</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {gameHistory.map((game, index) => (
                  <div key={index} className="text-xs bg-gray-800/50 p-2 rounded">
                    <div className="flex justify-between items-center">
                      <span>
                        {getCardName(game.cardFrom.value)} → {getCardName(game.cardTo.value)}
                      </span>
                      <span className={game.won ? 'text-green-400 flex items-center' : 'text-red-400 flex items-center'}>
                        {game.won ? '+' : ''}<span className="material-symbols-outlined">poker_chip</span>{game.payout.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-3">
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 border border-pink-500/30">
              {/* Game Message */}
              <div className="text-center mb-8">
                <p className={`text-xl font-semibold ${message.includes('BIG WIN') || message.includes('won') ? 'text-green-400 animate-pulse' : message.includes('better luck') || message.includes('Wrong')? 'text-red-500' : 'text-gold-300'}`}>
                  {message}
                </p>
              </div>

              {/* Cards Display */}
              <div className="flex justify-center items-center space-x-8 mb-8">
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-4 text-pink-400">{t("Current Card")}</h3>
                  {renderCard(currentCard)}
                </div>
                
                <div className="text-6xl text-pink-400 animate-pulse">VS</div>
                
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-4 text-pink-400">{t("Next Card")}</h3>
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
                      {t("HIGHER")}
                    </button>
                    <button
                      onClick={() => makeGuess('lower')}
                      disabled={balance < bet || bet <= 0}
                      className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-xl shadow-lg transition-all transform hover:scale-105 flex items-center"
                    >
                      <TrendingDown className="w-6 h-6 mr-2" />
                      {t("LOWER")}
                    </button>
                    <button
                      onClick={() => makeGuess('tie')}
                      disabled={balance < bet || bet <= 0}
                      className="px-8 py-4 bg-gradient-to-r from-orange-600 to-blue-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-xl shadow-lg transition-all transform hover:scale-105 flex items-center"
                    >
                      <Equal className="w-6 h-6 mr-2" />
                      {t("TIE")}
                    </button>
                  </>
                ) : gameState === 'complete' ? (
                  <button
                    onClick={nextRound}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-bold text-xl shadow-lg transition-all transform hover:scale-105 flex items-center"
                  >
                    <RefreshCw className="w-6 h-6 mr-2" />
                    {t("NEXT ROUND")}
                  </button>
                ) : (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-yellow-400 animate-pulse">
                     {(" Dealing card...")}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Controls */}
              <div className="flex justify-center space-x-4">
                <button onClick={resetGame} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition-colors">
                  {t("Reset Game")}
                </button>
                {balance === 0 && (
                  <button onClick={() => setBalance(10000)} className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 rounded font-semibold transition-colors">
                    {t("Add Credits")}
                  </button>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasinoHighLow;