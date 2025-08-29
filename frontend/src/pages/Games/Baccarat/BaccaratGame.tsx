import { useState, useEffect } from 'react';
import './Baccarat.css'
import { useAuth } from '../../../services/authContext';
import { baccaratService, BetType } from '../../../services/baccaratService';
import { motion } from 'framer-motion';

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: number;
  display: string;
  faceValue: number;
}

interface Bet {
  type: BetType;
  amount: number;
}

const CardComponent = ({ card, isRevealed, delay = 0 }: { 
  card?: Card; 
  isRevealed: boolean; 
  delay?: number;
}) => {
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (isRevealed && card) {
      const timer = setTimeout(() => setShowCard(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShowCard(false);
    }
  }, [isRevealed, card, delay]);

  const isRed = card?.suit === '♥' || card?.suit === '♦';

  return (
    <div className={`relative w-20 h-28 transition-all duration-500 ${showCard ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
      <div className={`absolute inset-0 rounded-xl shadow-2xl transform transition-transform duration-700 ${showCard ? 'rotateY-0' : 'rotateY-180'}`}
        style={{ transformStyle: 'preserve-3d' }}>
        {/* Card Back */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 border-2 border-gold-400 flex items-center justify-center backface-hidden"
          style={{ transform: 'rotateY(180deg)' }}>
          <div className="w-12 h-16 bg-gradient-to-br from-gold-300 to-gold-600 rounded-lg flex items-center justify-center">
            <div className="text-blue-900 font-bold text-xs">🂠</div>
          </div>
        </div>

        {/* Card Front */}
        <div className="absolute inset-0 rounded-xl bg-white border-2 border-gray-300 shadow-inner backface-hidden">
          {card && (
            <div className="p-2 h-full flex flex-col justify-between">
              <div className={`text-lg font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
                {card.display}
              </div>
              <div className={`text-4xl ${isRed ? 'text-red-600' : 'text-black'} text-center`}>
                {card.suit}
              </div>
              <div className={`text-lg font-bold ${isRed ? 'text-red-600' : 'text-black'} transform rotate-180 self-end`}>
                {card.display}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChipComponent = ({ value, selected, onClick }: {
  value: number;
  selected: boolean;
  onClick: (value: number) => void;
}) => (
  <button onClick={() => onClick(value)}
    className={`relative w-16 h-16 rounded-full border-4 font-bold text-sm shadow-2xl transform transition-all duration-300 hover:scale-110 active:scale-95 ${
      selected 
        ? 'border-yellow-300 bg-gradient-to-br from-yellow-200 to-yellow-400 text-black ring-4 ring-yellow-400/50' 
        : value === 10 ? 'border-red-400 bg-gradient-to-br from-red-500 to-red-700 text-white'
        : value === 25 ? 'border-green-400 bg-gradient-to-br from-green-500 to-green-700 text-white'
        : value === 50 ? 'border-blue-400 bg-gradient-to-br from-blue-500 to-blue-700 text-white'
        : value === 100 ? 'border-black bg-gradient-to-br from-gray-800 to-black text-white'
        : value === 250 ? 'border-black bg-gradient-to-br from-orange-600 to-orange-800 text-white'
        : 'border-purple-400 bg-gradient-to-br from-purple-500 to-purple-700 text-white'
    }`}>
    {value}
  </button>
);

const BettingArea = ({ type, bet, onBet, payout }: {
  type: BetType;
  bet: Bet | null;
  onBet: (type: BetType) => void;
  payout: string;
}) => {
  const isActive = bet?.type === type;
  
  return (
    <button onClick={() => onBet(type)} className={`relative p-6 rounded-2xl border-4 font-bold text-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
        type === BetType.Player
          ? 'bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400 text-white hover:from-blue-500 hover:to-blue-700'
        : type === BetType.Banker
          ? 'bg-gradient-to-br from-pink-600 to-pink-800 border-pink-400 text-white hover:from-pink-500 hover:to-pink-700'
          : 'bg-gradient-to-br from-green-600 to-green-800 border-green-400 text-white hover:from-green-500 hover:to-green-700'
      } ${isActive ? 'ring-4 ring-yellow-400 shadow-2xl' : 'shadow-lg'}`}>
      <div className="text-center">
        <div className="text-2xl font-bold mb-1">{type.toUpperCase()}</div>
        <div className="text-sm opacity-90">{payout}</div>
      </div>
      
      {isActive && bet && (
        <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-sm border-2 border-yellow-300 animate-pulse">
          ${bet.amount}
        </div>
      )}
    </button>
  );
};

const ScoreDisplay = ({ cards, title, color }: {
  cards: Card[];
  title: string;
  color: string;
}) => {
  const total = cards.reduce((sum, c) => sum + c.value, 0) % 10;
  
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold mb-2 ${color}`}>{title}</div>
      <div className="flex justify-center gap-2 mb-4 min-h-28">
        {cards.map((card, idx) => (
          <CardComponent
            key={idx}
            card={card}
            isRevealed={true}
            delay={idx * 500}
          />
        ))}
      </div>
      <div className={`text-4xl font-bold ${color} bg-black/20 rounded-xl px-4 py-2 border-2 ${
        color.includes('blue') ? 'border-blue-400' : 
        color.includes('red') ? 'border-red-400' : 'border-pink-400'
      }`}>
        {total}
      </div>
    </div>
  );
};

const PremiumBaccarat = () => {
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [bankerCards, setBankerCards] = useState<Card[]>([]);
  const [bet, setBet] = useState<Bet | null>(null);
  const [selectedChip, setSelectedChip] = useState(10);
  const [message, setMessage] = useState('Place your bet to begin');
  const [coins, setCoins] = useState(5000);
  const [isDealing, setIsDealing] = useState(false);
  const [gameHistory, setGameHistory] = useState<BetType[]>([]);
  const [showWin, setShowWin] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const { token, balance, setBalance } = useAuth(); 

  const calculateTotal = (cards: Card[]) => cards.reduce((sum, c) => sum + c.value, 0) % 10;

  const placeBet = (betType: BetType) => {
    if (coins < selectedChip || isDealing) return;
    
    setBet({ type: betType, amount: selectedChip });
    setCoins(prev => prev - selectedChip);
    setMessage(`Bet placed: $${selectedChip} on ${betType}`);
  };

  const deal = async () => {
    if (!bet || isDealing || !token) return;
  
    setIsDealing(true);
    setMessage("Dealing cards...");
    setPlayerCards([]);
    setBankerCards([]);
    setShowWin(false);
  
    try {
      console.log("bet.type", bet.type);
      console.log("bet.amount", bet.amount);
      console.log("token", token);

      const result: any = await baccaratService.playRound(bet.type , bet.amount, token);
      console.log("result", result)
  
      setPlayerCards(result.playerCards);
      setBankerCards(result.bankerCards);
      setGameHistory(prev => [result.winner, ...prev.slice(0, 9)]);
      setBalance(result.newBalance);
      setMessage(result.message); 

      if (result.WinAmount > 0) {
        setWinAmount(result.WinAmount);
        setShowWin(true);
        setTimeout(() => setShowWin(false), 3000);
      }
  
    } catch (err) {
      console.error("Baccarat API failed:", err);
      setMessage("Something went wrong. Try again.");
    } finally {
      setIsDealing(false);
      setRoundNumber(prev => prev + 1);
      setTimeout(() => {
        setBet(null);
        setMessage("Place your bet for the next round");
      }, 4000);
    }
  };

  const clearBet = () => {
    if (bet && !isDealing) {
      setCoins(prev => prev + bet.amount);
      setBet(null);
      setMessage('Bet cleared');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-pink-500 to-purple-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffd700' fill-opacity='0.1'%3E%3Cpath d='M50 50m-20 0a20,20 0 1,1 40,0a20,20 0 1,1 -40,0'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Win Animation */}
      {showWin && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50 text-center">
          <div className="bg-black/80 rounded-3xl p-8 border-4 border-gold-400 animate-pulse">
            <div className="text-6xl font-bold text-gold-400 mb-4 animate-bounce">
              💰 WINNER! 💰
            </div>
            <div className="text-4xl text-green-400 font-bold">
              +${winAmount}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <motion.h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-900 mb-2"
            animate={{ 
              textShadow: [
                "0 0 20px pink",
                "0 0 40px purple, 0 0 60px violet",
                "0 0 20px violet"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            PREMIUM BACCARAT
          </motion.h1>
        </div>

        {/* Game History */}
        {gameHistory.length > 0 && (
          <div className="flex justify-center mb-8">
            <div className="bg-black/40 rounded-2xl p-4 border border-gold-500/30">
              <div className="text-white font-semibold mb-3 text-center">RECENT RESULTS</div>
              <div className="flex gap-2">
                {gameHistory.map((result, index) => (
                  <div
                    key={index}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 ${
                      result === BetType.Player ? 'bg-blue-600 border-blue-400' :
                      result === BetType.Banker ? 'bg-red-600 border-red-400' :
                      'bg-green-600 border-green-400'
                    } ${index === 0 ? 'ring-2 ring-gold-400 scale-110' : ''}`}
                  >
                    {result[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Game Area */}
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-pink-800 to-purple-400 rounded-3xl border-4 border-gold-600 shadow-2xl p-8 mb-8">
          
          {/* Game Stats */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-8 bg-black/40 rounded-2xl p-6 border-2 border-gold-500/30">
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-400">${balance.toLocaleString()}</div>
              <div className="text-sm text-gray-300">BALANCE</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">${bet?.amount || 0}</div>
              <div className="text-sm text-gray-300">CURRENT BET</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{gameHistory.length}</div>
              <div className="text-sm text-gray-300">ROUNDS PLAYED</div>
            </div>
          </div>
        </div>
          {/* Card Areas */}
          <div className="flex justify-center gap-16 mb-8">
            <ScoreDisplay 
              cards={playerCards} 
              title="PLAYER" 
              color="text-blue-400"
            />
            <ScoreDisplay 
              cards={bankerCards} 
              title="BANKER" 
              color="text-pink-400"
            />
          </div>

          {/* Game Message */}
          <div className="text-center mb-8">
            <div className={`text-2xl font-bold min-h-8 transition-all duration-500 ${
              message.includes('wins') || message.includes('won') ? 'text-green-400 animate-pulse' : 'text-gold-300'
            }`}>
              {message}
            </div>
          </div>

          {/* Betting Areas */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <BettingArea 
              type={BetType.Player}
              bet={bet} 
              onBet={placeBet} 
              payout="Pays 1:1"
            />
            <BettingArea 
              type={BetType.Banker} 
              bet={bet} 
              onBet={placeBet} 
              payout="Pays 1:1 (-5%)"
            />
            <BettingArea 
              type={BetType.Tie}
              bet={bet} 
              onBet={placeBet} 
              payout="Pays 8:1"
            />
          </div>
          
        </div>

        {/* Controls */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Action Buttons */}
            <div className="flex-1 bg-black/40 rounded-2xl p-6 border border-gold-500/30">
              <div className="text-white font-bold mb-4 text-center text-xl">ACTIONS</div>
              <div className="space-y-4">
                <button
                  onClick={deal}
                  disabled={!bet || isDealing}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold text-xl rounded-2xl border-2 border-green-400 shadow-lg hover:from-green-500 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  {isDealing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">🎴</span>
                      DEALING...
                    </span>
                  ) : (
                    'DEAL CARDS'
                  )}
                </button>

                <button
                  onClick={clearBet}
                  disabled={!bet || isDealing}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-xl border border-red-400 hover:from-red-500 hover:to-red-700 disabled:opacity-50 transition-all duration-300"
                >
                  CLEAR BET
                </button>
              </div>

              {/* Bet Summary */}
              {bet && (
                <div className="mt-6 pt-4 border-t border-gray-600">
                  <div className="text-white font-semibold mb-2">CURRENT BET:</div>
                  <div className="text-gold-400 font-bold">
                    ${bet.amount} on {bet.type}
                  </div>
                </div>
              )}
            </div>
            
            {/* Chips */}
            <div className="flex-1 bg-black/40 rounded-2xl p-6 border border-gold-500/30">
              <div className="text-white font-bold mb-4 text-center text-xl">SELECT CHIP</div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[10, 25, 50, 100, 250, 500].map(value => (
                  <ChipComponent
                    key={value}
                    value={value}
                    selected={selectedChip === value}
                    onClick={setSelectedChip}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="max-w-4xl mx-auto mt-8 bg-black/40 rounded-2xl p-6 border border-gold-500/30">
          <h3 className="text-2xl font-bold text-gold-400 mb-4 text-center">GAME RULES</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="text-white">
              <div className="font-semibold text-blue-400 mb-2">PLAYER BET</div>
              <div className="text-sm">Pays 1:1 • House Edge 1.24%</div>
            </div>
            <div className="text-white">
              <div className="font-semibold text-pink-400 mb-2">BANKER BET</div>
              <div className="text-sm">Pays 1:1 minus 5% • House Edge 1.06%</div>
            </div>
            <div className="text-white">
              <div className="font-semibold text-green-400 mb-2">TIE BET</div>
              <div className="text-sm">Pays 8:1 • House Edge 14.4%</div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default PremiumBaccarat;