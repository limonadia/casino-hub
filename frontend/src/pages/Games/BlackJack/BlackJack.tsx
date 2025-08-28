import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { BlackjackState, Card } from '../../../models/blackjackModel';
import { blackJackService } from '../../../services/blackJackService';
import { useAuth } from '../../../services/authContext';

const PlayingCard = ({ card, hidden = false, isDealt = false }: { 
  card: Card; 
  hidden?: boolean; 
  isDealt?: boolean; 
}) => {
  const isRed = card.suit === '♥' || card.suit === '♦';

  if (hidden) {
    return (
      <motion.div
        initial={{ rotateY: 0, x: -100, opacity: 0 }}
        animate={isDealt ? { rotateY: 0, x: 0, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-20 h-28 bg-gradient-to-br from-red-800 to-red-900 rounded-lg border-2 border-red-700 shadow-lg flex items-center justify-center mx-1"
        style={{ perspective: '1000px' }}
      >
        <div className="text-white text-xs font-bold transform rotate-45">🂠</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ rotateY: 180, x: -100, opacity: 0 }}
      animate={isDealt ? { rotateY: 0, x: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: Math.random() * 0.3 }}
      className="w-20 h-28 bg-white rounded-lg border-2 border-gray-300 shadow-lg flex flex-col items-center justify-between p-2 mx-1 relative"
      style={{ perspective: '1000px' }}
      whileHover={{ scale: 1.05, zIndex: 10 }}
    >
      <div className={`text-sm font-bold ${isRed ? 'text-red-600' : 'text-black'} self-start leading-none`}>
        <div>{card.value}</div>
        <div className="text-lg leading-none">{card.suit}</div>
      </div>
      <div className={`text-3xl ${isRed ? 'text-red-600' : 'text-black'}`}>{card.suit}</div>
      <div className={`text-sm font-bold ${isRed ? 'text-red-600' : 'text-black'} self-end leading-none transform rotate-180`}>
        <div>{card.value}</div>
        <div className="text-lg leading-none">{card.suit}</div>
      </div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg pointer-events-none"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      /></motion.div>
  );
};

const BlackjackGame = () => {
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerTurn, setPlayerTurn] = useState(false);
  const [gameOver, setGameOver] = useState(true);
  const [message, setMessage] = useState('Place your bet to start!');
  const [bet, setBet] = useState(50);
  const [winAmount, setWinAmount] = useState(0);
  const [isDealing, setIsDealing] = useState(false);
  const { balance, refreshBalance } = useAuth();
  
  const playSound = (type: any) => console.log(`Playing ${type} sound`);

  const updateGameState = async (state: BlackjackState) => {
    setPlayerCards(state.playerCards ?? []);
    setDealerCards(state.dealerCards ?? []);
    setDeck(state.deck ?? []);
    setBet(state.bet ?? bet);
    setMessage(state.message ?? '');
    setPlayerTurn(!state.gameOver);
    setGameOver(state.gameOver ?? true);

    if (state.winAmount !== 0 && state.winAmount != null) {
      try {
        await refreshBalance()
      } catch (err) {
          console.error("Balance update failed:", err);
      }
    }

    if (state.winAmount != null && state.winAmount > 0) {
      setWinAmount(state.winAmount);
      playSound('win');
    } else if (state.winAmount!= null && state.winAmount < 0) {
      setWinAmount(-state.winAmount);
      playSound('lose');
    } else if (state.winAmount != null && state.winAmount == 0){
      setWinAmount(0);
      playSound('lose');
    }
  };

  const startGame = async () => {
    if (balance < bet || !gameOver) return;
  
    setIsDealing(true);
    setGameOver(false);
    setPlayerTurn(true);
    setMessage('Dealing cards...');
  
    try {
      const state = await blackJackService.startGame(bet, balance);
      await updateGameState(state);
      if (state.coins !== undefined) {
        await refreshBalance();
      }
    } catch (err: any) {
      setMessage(err.message);
      setGameOver(true);
    } finally {
      setIsDealing(false);
    }
    playSound('deal');
  };

  const hit = async () => {
    if (!playerTurn || gameOver) return;

    try {
      const state = await blackJackService.hit(deck, playerCards, balance, bet, dealerCards);
      updateGameState(state);
    } catch (err: any) {
      setMessage(err.message);
    }

    playSound('hit');
  };

  const stand = async () => {
    if (!playerTurn || gameOver) return;

    try {
      const state = await blackJackService.stand(deck, playerCards, dealerCards, balance, bet);
      updateGameState(state);
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const playerScore = (playerCards || []).reduce((sum, c) => sum + c.numValue, 0);
  const dealerScore = (dealerCards || []).reduce((sum, c) => sum + c.numValue, 0);

  useEffect(() => {
    if (playerScore > 21) {
      setGameOver(true);
    }
  }, [playerScore]); 

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-pink-500 to-pink-900 relative overflow-hidden w-full">
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="text-center mb-6">
          <motion.h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2"
            animate={{ textShadow: [
              "0 0 20px #ffd700",
              "0 0 40px #ffd700",
              "0 0 20px #ffd700"]}}
            transition={{ duration: 2, repeat: Infinity }}>
            BLACKJACK
          </motion.h1>
        </div>
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-pink-500 to-blue-800 rounded-3xl border-8 border-yellow-600 shadow-2xl overflow-hidden">
          <div className="relative p-8">
            {/* Dealer Section */}
            <div className="text-center mb-8">
              <div className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <span>🎩 DEALER</span>
                <span className="text-lg">
                  {gameOver ? `(${dealerScore})` : (dealerCards.length > 0 ? dealerCards[0].value + dealerCards[0].suit : '(?)')}
                </span>
              </div>
              <div className="flex justify-center items-center min-h-32">
                {(dealerCards || []).map((card, index) => (
                  <PlayingCard key={index} card={card} hidden={index === 1 && playerTurn && !gameOver} isDealt={true}/>
                ))}
              </div>
            </div>
            {/* Text Section */}
            <div className="text-center mb-6">
              <motion.div className={`text-2xl font-bold min-h-8 ${winAmount == bet || message.includes("Place your bet to start") || message.includes("Hit or Stand?") ? 'text-yellow-500' : winAmount == 0 ? 'text-red-500' : winAmount > bet ? 'text-green-500' : 'text-white'}`}  
                animate={winAmount > 0 || message.includes('Dealer wins') || message.includes('You lose') ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: 2 }}>
                  {message}
                {winAmount > 0 && (
                  <span className="ml-2 text-green-400 font-bold">+{winAmount}</span>
                )}
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
                {(playerCards || []).map((card, index) => (
                  <PlayingCard key={index} card={card} isDealt={true} />
                ))}
              </div>
            </div>
            {/* Bet Section */}
            <div className="sm:bg-black/30 rounded-2xl p-6 sm:border border-yellow-500/30 flex flex-col md:flex-row justify-between">
              <div className="flex justify-center mb-6">
                <div className="flex gap-6 bg-black/30 rounded-xl p-4 border border-yellow-500/30">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{balance.toLocaleString()}</div>
                    <div className="text-sm text-gray-300">COINS</div>
                  </div>
                </div>
              </div>
              <div className='w-full pl-4'>
                <div className="flex flex-wrap justify-center items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">BET:</span>
                    <button onClick={() => setBet(Math.max(25, bet - 25))} disabled={!gameOver} className="w-full sm:w-auto px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 disabled:opacity-50 font-bold">
                      -25
                    </button>
                    <div className="w-full sm:w-auto bg-black/50 px-4 py-2 rounded-lg text-yellow-400 font-bold min-w-16 text-center">
                      {bet}
                    </div>
                    <button onClick={() => setBet(Math.min(500, balance, bet + 25))} disabled={!gameOver} className="w-full sm:w-auto px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50 font-bold">
                      +25
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {gameOver && (
                      <motion.button
                        onClick={startGame}
                        disabled={balance < bet}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-xl border-2 border-blue-400 shadow-lg hover:from-blue-500 hover:to-blue-700 disabled:opacity-50 transition-all"
                        whileHover={{ scale: balance >= bet ? 1.05 : 1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isDealing ? 'DEALING...' : 'DEAL'}
                      </motion.button>
                    )}
                    
                    {playerTurn && !gameOver && (
                      <>
                        <button onClick={hit} className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold rounded-lg border border-green-400 hover:from-green-500 hover:to-green-700 transition-all">
                          HIT
                        </button>
                        <button onClick={stand} className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-lg border border-red-400 hover:from-red-500 hover:to-red-700 transition-all">
                          STAND
                        </button>
                      </>
                    )}
                  </div>
                </div>
              
                {gameOver && (
                  <div className="flex  gap-2 mt-4 justify-center">
                    <span className="text-gray-300 text-sm mr-2">Quick Bet:</span>
                    {[25, 50, 100, 250].map(amount => (
                      <button key={amount} onClick={() => setBet(amount)} disabled={balance < amount} className="w-full sm:w-auto px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50">
                        {amount}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
