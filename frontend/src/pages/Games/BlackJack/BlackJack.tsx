import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Card types
interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  numValue: number;
}

const suits: Array<'♠' | '♥' | '♦' | '♣'> = ['♠', '♥', '♦', '♣'];
const values = [
  { value: 'A', numValue: 11 },
  { value: '2', numValue: 2 },
  { value: '3', numValue: 3 },
  { value: '4', numValue: 4 },
  { value: '5', numValue: 5 },
  { value: '6', numValue: 6 },
  { value: '7', numValue: 7 },
  { value: '8', numValue: 8 },
  { value: '9', numValue: 9 },
  { value: '10', numValue: 10 },
  { value: 'J', numValue: 10 },
  { value: 'Q', numValue: 10 },
  { value: 'K', numValue: 10 }
];

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  suits.forEach(suit => {
    values.forEach(val => {
      deck.push({ suit, value: val.value, numValue: val.numValue });
    });
  });
  return deck.sort(() => Math.random() - 0.5);
};

const calculateScore = (cards: Card[]): number => {
  let score = 0;
  let aces = 0;
  
  cards.forEach(card => {
    if (card.value === 'A') {
      aces++;
      score += 11;
    } else {
      score += card.numValue;
    }
  });
  
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  
  return score;
};

const PlayingCard = ({ card, hidden = false, isDealt = false }: { 
  card: Card; 
  hidden?: boolean; 
  isDealt?: boolean; 
}) => {
  if (hidden) {
    return (
      <motion.div
        initial={{ rotateY: 0, x: -100, opacity: 0 }}
        animate={isDealt ? { rotateY: 0, x: 0, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-20 h-28 bg-gradient-to-br from-red-800 to-red-900 rounded-lg border-2 border-red-700 shadow-lg flex items-center justify-center mx-1"
        style={{ perspective: '1000px' }}
      >
        <div className="text-white text-xs font-bold transform rotate-45">
          🂠
        </div>
      </motion.div>
    );
  }

  const isRed = card.suit === '♥' || card.suit === '♦';
  
  return (
    <motion.div
      initial={{ rotateY: 180, x: -100, opacity: 0 }}
      animate={isDealt ? { rotateY: 0, x: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: Math.random() * 0.3 }}
      className="w-20 h-28 bg-white rounded-lg border-2 border-gray-300 shadow-lg flex flex-col items-center justify-between p-2 mx-1 relative"
      style={{ perspective: '1000px' }}
      whileHover={{ scale: 1.05, zIndex: 10 }}
    >
      {/* Top left corner */}
      <div className={`text-sm font-bold ${isRed ? 'text-red-600' : 'text-black'} self-start leading-none`}>
        <div>{card.value}</div>
        <div className="text-lg leading-none">{card.suit}</div>
      </div>
      
      {/* Center suit */}
      <div className={`text-3xl ${isRed ? 'text-red-600' : 'text-black'}`}>
        {card.suit}
      </div>
      
      {/* Bottom right corner (rotated) */}
      <div className={`text-sm font-bold ${isRed ? 'text-red-600' : 'text-black'} self-end leading-none transform rotate-180`}>
        <div>{card.value}</div>
        <div className="text-lg leading-none">{card.suit}</div>
      </div>
      
      {/* Card shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg pointer-events-none"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

const BlackjackGame = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [playerTurn, setPlayerTurn] = useState(false);
  const [gameOver, setGameOver] = useState(true);
  const [message, setMessage] = useState('Place your bet to start!');
  const [coins, setCoins] = useState(2500);
  const [bet, setBet] = useState(50);
  const [showWin, setShowWin] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [gameStats, setGameStats] = useState({ wins: 0, losses: 0, draws: 0 });
  const [isDealing, setIsDealing] = useState(false);
  const [canDoubleDown, setCanDoubleDown] = useState(false);
  const [insurance, setInsurance] = useState(false);
  const [insuranceBet, setInsuranceBet] = useState(0);

  const playSound = (type: any) => {
    console.log(`Playing ${type} sound`);
  };

  const startGame = () => {
    if (coins < bet || !gameOver) return;
    
    setCoins(prev => prev - bet);
    setIsDealing(true);
    setGameOver(false);
    setPlayerTurn(true);
    setMessage('');
    setShowWin(false);
    setCanDoubleDown(true);
    setInsurance(false);
    setInsuranceBet(0);
    
    const newDeck = createDeck();
    
    // Deal initial cards with animation delay
    setTimeout(() => {
      const playerStart = [newDeck.pop()!, newDeck.pop()!];
      const dealerStart = [newDeck.pop()!, newDeck.pop()!];
      
      setDeck(newDeck);
      setPlayerCards(playerStart);
      setDealerCards(dealerStart);
      
      // Check for blackjacks
      const playerScore = calculateScore(playerStart);
      const dealerScore = calculateScore(dealerStart);
      
      // Check for insurance if dealer shows Ace
      if (dealerStart[0].value === 'A' && playerScore !== 21) {
        setMessage('Dealer shows Ace. Insurance?');
        return;
      }
      
      if (playerScore === 21) {
        if (dealerScore === 21) {
          endGame('Push! Both have Blackjack', 0, 'draw');
        } else {
          endGame('🎉 BLACKJACK! 🎉', Math.floor(bet * 2.5), 'win');
        }
      } else if (dealerScore === 21) {
        endGame('Dealer Blackjack!', 0, 'loss');
      } else {
        setMessage('Hit or Stand?');
      }
      
      setIsDealing(false);
    }, 1000);
    
    playSound('deal');
  };

  const hit = () => {
    if (!playerTurn || gameOver) return;
    
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const newPlayerCards = [...playerCards, card];
    
    setPlayerCards(newPlayerCards);
    setDeck(newDeck);
    setCanDoubleDown(false);
    
    const score = calculateScore(newPlayerCards);
    
    if (score > 21) {
      endGame('BUST! You lose.', 0, 'loss');
    } else if (score === 21) {
      stand();
    } else {
      setMessage('Hit or Stand?');
    }
    
    playSound('hit');
  };

  const stand = () => {
    if (!playerTurn || gameOver) return;
    
    setPlayerTurn(false);
    setMessage('Dealer playing...');
    
    let currentDealerCards = [...dealerCards];
    const newDeck = [...deck];
    
    // Dealer draws
    const dealerDraw = () => {
      while (calculateScore(currentDealerCards) < 17) {
        const card = newDeck.pop()!;
        currentDealerCards.push(card);
      }
      
      setDealerCards(currentDealerCards);
      setDeck(newDeck);
      
      const playerScore = calculateScore(playerCards);
      const dealerScore = calculateScore(currentDealerCards);
      
      if (dealerScore > 21) {
        endGame('Dealer BUST! You win!', bet * 2, 'win');
      } else if (playerScore > dealerScore) {
        endGame('You win!', bet * 2, 'win');
      } else if (playerScore === dealerScore) {
        endGame('Push!', bet, 'draw');
      } else {
        endGame('Dealer wins!', 0, 'loss');
      }
    };
    
    setTimeout(dealerDraw, 1500);
  };

  const doubleDown = () => {
    if (!canDoubleDown || coins < bet) return;
    
    setCoins(prev => prev - bet);
    setBet(prev => prev * 2);
    setCanDoubleDown(false);
    
    // Draw one card then stand
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const newPlayerCards = [...playerCards, card];
    
    setPlayerCards(newPlayerCards);
    setDeck(newDeck);
    
    const score = calculateScore(newPlayerCards);
    
    if (score > 21) {
      endGame('BUST! You lose.', 0, 'loss');
    } else {
      setTimeout(() => stand(), 1000);
    }
    
    playSound('hit');
  };

  const takeInsurance = () => {
    const insuranceAmount = Math.floor(bet / 2);
    if (coins < insuranceAmount) return;
    
    setCoins(prev => prev - insuranceAmount);
    setInsuranceBet(insuranceAmount);
    setInsurance(true);
    
    // Check if dealer has blackjack
    const dealerScore = calculateScore(dealerCards);
    if (dealerScore === 21) {
      setCoins(prev => prev + insuranceAmount * 3); // Insurance pays 2:1
      setMessage('Insurance pays! Dealer has Blackjack.');
    } else {
      setMessage('No Blackjack. Hit or Stand?');
    }
  };

  const endGame = (msg: string, winnings: number, result: 'win' | 'loss' | 'draw') => {
    setMessage(msg);
    setGameOver(true);
    setPlayerTurn(false);
    setCoins(prev => prev + winnings);
    
    if (winnings > 0) {
      setWinAmount(winnings);
      setShowWin(true);
      playSound('win');
      setTimeout(() => setShowWin(false), 3000);
    }
    
    // Update stats
    setGameStats(prev => ({
      ...prev,
      [result === 'win' ? 'wins' : result === 'loss' ? 'losses' : 'draws']: prev[result === 'win' ? 'wins' : result === 'loss' ? 'losses' : 'draws'] + 1
    }));
    
    // Reset bet if doubled
    if (bet > 100) {
      setBet(50);
    }
  };

  const playerScore = calculateScore(playerCards);
  const dealerScore = calculateScore(dealerCards);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 relative overflow-hidden">
      {/* Casino Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffd700' fill-opacity='0.1'%3E%3Cpolygon points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Win Animation */}
      <AnimatePresence>
        {showWin && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-1/4 left-1/2 transform -translate-x-1/2 z-50 text-center"
          >
            <div className="text-6xl font-bold text-yellow-400 animate-bounce">
              💰 WIN! 💰
            </div>
            <div className="text-3xl text-green-400 font-bold mt-2">
              +{winAmount} COINS!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <motion.h1 
            className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2"
            animate={{ 
              textShadow: [
                "0 0 20px #ffd700",
                "0 0 40px #ffd700",
                "0 0 20px #ffd700"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            BLACKJACK
          </motion.h1>
          <div className="text-xl text-yellow-200">21 • Classic Casino Game</div>
        </div>

        {/* Game Stats */}
        <div className="flex justify-center mb-6">
          <div className="flex gap-6 bg-black/30 rounded-xl p-4 border border-yellow-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{gameStats.wins}</div>
              <div className="text-sm text-gray-300">WINS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{gameStats.losses}</div>
              <div className="text-sm text-gray-300">LOSSES</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{gameStats.draws}</div>
              <div className="text-sm text-gray-300">PUSHES</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{coins.toLocaleString()}</div>
              <div className="text-sm text-gray-300">COINS</div>
            </div>
          </div>
        </div>

        {/* Blackjack Table */}
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-green-600 to-green-800 rounded-3xl border-8 border-yellow-600 shadow-2xl overflow-hidden">
          {/* Table Felt */}
          <div className="relative p-8">
            {/* Dealer Section */}
            <div className="text-center mb-8">
              <div className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <span>🎩 DEALER</span>
                <span className="text-lg">
                  {gameOver || !playerTurn ? `(${dealerScore})` : '(?)'} 
                </span>
                {dealerScore === 21 && dealerCards.length === 2 && (
                  <span className="text-yellow-400 animate-pulse">BLACKJACK!</span>
                )}
              </div>
              <div className="flex justify-center items-center min-h-32">
                {dealerCards.map((card, index) => (
                  <PlayingCard
                    key={index}
                    card={card}
                    hidden={playerTurn && index === 1 && !gameOver}
                    isDealt={true}
                  />
                ))}
                {dealerCards.length === 0 && (
                  <div className="text-gray-400 italic">Waiting for cards...</div>
                )}
              </div>
            </div>

            {/* Game Message */}
            <div className="text-center mb-6">
              <motion.div
                className="text-2xl font-bold text-yellow-300 min-h-8"
                animate={message.includes('WIN') || message.includes('BLACKJACK') ? 
                  { scale: [1, 1.1, 1], color: ['#fcd34d', '#22c55e', '#fcd34d'] } : {}
                }
                transition={{ duration: 0.5, repeat: message.includes('WIN') ? 3 : 0 }}
              >
                {message}
              </motion.div>
            </div>

            {/* Player Section */}
            <div className="text-center">
              <div className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <span>👤 PLAYER</span>
                <span className="text-lg">({playerScore})</span>
                {playerScore === 21 && playerCards.length === 2 && (
                  <span className="text-yellow-400 animate-pulse">BLACKJACK!</span>
                )}
                {playerScore > 21 && (
                  <span className="text-red-400 animate-pulse">BUST!</span>
                )}
              </div>
              <div className="flex justify-center items-center min-h-32 mb-6">
                {playerCards.map((card, index) => (
                  <PlayingCard key={index} card={card} isDealt={true} />
                ))}
                {playerCards.length === 0 && (
                  <div className="text-gray-400 italic">Place your bet to start!</div>
                )}
              </div>
            </div>

            {/* Betting Area */}
            <div className="bg-black/30 rounded-2xl p-6 border border-yellow-500/30">
              <div className="flex flex-wrap justify-center items-center gap-4">
                {/* Bet Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">BET:</span>
                  <button
                    onClick={() => setBet(Math.max(25, bet - 25))}
                    disabled={!gameOver}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 disabled:opacity-50 font-bold"
                  >
                    -25
                  </button>
                  <div className="bg-black/50 px-4 py-2 rounded-lg text-yellow-400 font-bold min-w-16 text-center">
                    {bet}
                  </div>
                  <button
                    onClick={() => setBet(Math.min(500, coins, bet + 25))}
                    disabled={!gameOver}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50 font-bold"
                  >
                    +25
                  </button>
                </div>

                {/* Game Actions */}
                <div className="flex gap-2">
                  {gameOver && (
                    <motion.button
                      onClick={startGame}
                      disabled={coins < bet}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-xl border-2 border-blue-400 shadow-lg hover:from-blue-500 hover:to-blue-700 disabled:opacity-50 transition-all"
                      whileHover={{ scale: coins >= bet ? 1.05 : 1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isDealing ? 'DEALING...' : 'DEAL'}
                    </motion.button>
                  )}
                  
                  {playerTurn && !gameOver && (
                    <>
                      <button
                        onClick={hit}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold rounded-lg border border-green-400 hover:from-green-500 hover:to-green-700 transition-all"
                      >
                        HIT
                      </button>
                      <button
                        onClick={stand}
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-lg border border-red-400 hover:from-red-500 hover:to-red-700 transition-all"
                      >
                        STAND
                      </button>
                      {canDoubleDown && coins >= bet && (
                        <button
                          onClick={doubleDown}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold rounded-lg border border-purple-400 hover:from-purple-500 hover:to-purple-700 transition-all"
                        >
                          DOUBLE
                        </button>
                      )}
                      {dealerCards[0]?.value === 'A' && !insurance && (
                        <button
                          onClick={takeInsurance}
                          disabled={coins < Math.floor(bet / 2)}
                          className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-800 text-white font-bold rounded-lg border border-yellow-400 hover:from-yellow-500 hover:to-yellow-700 disabled:opacity-50 transition-all"
                        >
                          INSURANCE
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Quick Bet Buttons */}
              {gameOver && (
                <div className="flex justify-center gap-2 mt-4">
                  <span className="text-gray-300 text-sm mr-2">Quick Bet:</span>
                  {[25, 50, 100, 250].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBet(amount)}
                      disabled={coins < amount}
                      className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50"
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="max-w-2xl mx-auto mt-8 bg-black/30 rounded-xl p-6 border border-yellow-500/30">
          <h3 className="text-xl font-bold text-yellow-400 mb-3 text-center">GAME RULES</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <div className="font-semibold text-white">Objective:</div>
              <div>Get cards totaling 21 or closest without going over</div>
            </div>
            <div>
              <div className="font-semibold text-white">Card Values:</div>
              <div>A=1/11, K/Q/J=10, Others=Face Value</div>
            </div>
            <div>
              <div className="font-semibold text-white">Blackjack:</div>
              <div>21 with first 2 cards pays 2.5:1</div>
            </div>
            <div>
              <div className="font-semibold text-white">Dealer:</div>
              <div>Must hit on 16, stand on 17</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlackjackGame;