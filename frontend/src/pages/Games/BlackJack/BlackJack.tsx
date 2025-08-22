import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import type { Card as CardType } from './types';
import { createDeck, calculateScore } from './utils';
import Card from './Card';
import useSound from 'use-sound';
import Confetti from 'react-confetti';

const BlackjackGame: React.FC = () => {
  const [deck, setDeck] = useState(createDeck());
  const [playerCards, setPlayerCards] = useState<CardType[]>([]);
  const [dealerCards, setDealerCards] = useState<CardType[]>([]);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [message, setMessage] = useState('');
  const [coins, setCoins] = useState(100);
  const [showConfetti, setShowConfetti] = useState(false);

  // Sounds
  const [playDeal] = useSound('/sounds/deal.mp3', { volume: 0.5 });
  const [playHit] = useSound('/sounds/hit.mp3', { volume: 0.5 });
  const [playWin] = useSound('/sounds/win.mp3', { volume: 0.7 });

  const startGame = (bet: number = 10) => {
    if (coins < bet) {
      setMessage("Not enough coins!");
      return;
    }

    playDeal();
    setShowConfetti(false);
    const newDeck = createDeck();
    const playerStart = [newDeck.pop()!, newDeck.pop()!];
    const dealerStart = [newDeck.pop()!, newDeck.pop()!];
    setDeck(newDeck);
    setPlayerCards(playerStart);
    setDealerCards(dealerStart);
    setPlayerTurn(true);
    setMessage('');
    setCoins(coins - bet);
  };

  const hit = () => {
    if (!playerTurn) return;
    playHit();
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const newPlayer = [...playerCards, card];
    setPlayerCards(newPlayer);
    setDeck(newDeck);

    const score = calculateScore(newPlayer);
    if (score > 21) {
      setMessage('BUST! You lose.');
      setPlayerTurn(false);
    }
  };

  const stand = (bet: number = 10) => {
    setPlayerTurn(false);
    let dealer = [...dealerCards];
    const newDeck = [...deck];
    while (calculateScore(dealer) < 17) {
      dealer.push(newDeck.pop()!);
    }
    setDealerCards(dealer);
    setDeck(newDeck);

    const playerScore = calculateScore(playerCards);
    const dealerScore = calculateScore(dealer);

    if (dealerScore > 21 || playerScore > dealerScore) {
      setMessage('You win!');
      playWin();
      setCoins(coins + bet * 2);
      setShowConfetti(true); // Show confetti
    } else if (playerScore === dealerScore) {
      setMessage('Draw!');
      setCoins(coins + bet);
    } else {
      setMessage('Dealer wins!');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4,
        backgroundColor: '#111',
        minHeight: '100vh',
        color: '#0ff',
        padding: 3,
        fontFamily: 'monospace',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      
      <Typography variant="h4" sx={{ mb: 2, textShadow: '0 0 10px #0ff, 0 0 20px #0ff' }}>
        Neon Blackjack
      </Typography>

      <Typography
        sx={{
          mb: 1,
          fontSize: 18,
          color: '#0ff',
          textShadow: showConfetti ? '0 0 20px lime, 0 0 40px lime' : '0 0 10px #0ff',
          transition: 'all 0.3s ease',
        }}
      >
        Coins: {coins}
      </Typography>

      {/* Dealer */}
      <Box sx={{ mt: 2 }}>
        <Typography>Dealer ({playerTurn ? '?' : calculateScore(dealerCards)})</Typography>
        <Box sx={{ display: 'flex', mt: 1 }}>
          {dealerCards.map((card, idx) => (
            <Card key={idx} card={card} hidden={playerTurn && idx === 1} />
          ))}
        </Box>
      </Box>

      {/* Player */}
      <Box sx={{ mt: 2 }}>
        <Typography>Player ({calculateScore(playerCards)})</Typography>
        <Box sx={{ display: 'flex', mt: 1 }}>
          {playerCards.map((card, idx) => (
            <Card
              key={idx}
              card={card}
              // Neon glow on win
              hidden={false}
            />
          ))}
        </Box>
      </Box>

      {/* Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => startGame(10)}
          sx={{ background: '#0ff', color: '#000' }}
        >
          Deal 10
        </Button>
        <Button
          variant="contained"
          onClick={hit}
          disabled={!playerTurn}
          sx={{ background: '#0ff', color: '#000' }}
        >
          Hit
        </Button>
        <Button
          variant="contained"
          onClick={() => stand(10)}
          disabled={!playerTurn}
          sx={{ background: '#0ff', color: '#000' }}
        >
          Stand
        </Button>
      </Box>

      {message && (
        <Typography
          variant="h5"
          sx={{
            mt: 3,
            color: message.includes('win') ? 'lime' : 'red',
            textShadow: message.includes('win') ? '0 0 20px lime, 0 0 40px lime' : '0 0 10px red',
            transition: 'all 0.3s ease',
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default BlackjackGame;
