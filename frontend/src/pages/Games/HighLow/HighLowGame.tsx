import React, { useState } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import Confetti from 'react-confetti';
import useSound from 'use-sound';

interface Card {
  value: number; // 1-13
  suit: string; // ♠ ♥ ♦ ♣
}

const suits = ['♠', '♥', '♦', '♣'];

const getRandomCard = (): Card => ({
  value: Math.floor(Math.random() * 13) + 1,
  suit: suits[Math.floor(Math.random() * suits.length)],
});

const cardName = (value: number) => {
  if (value === 1) return 'A';
  if (value === 11) return 'J';
  if (value === 12) return 'Q';
  if (value === 13) return 'K';
  return value.toString();
};

const UpgradedHighLowGame: React.FC = () => {
  const [coins, setCoins] = useState(1000);
  const [currentCard, setCurrentCard] = useState<Card>(getRandomCard());
  const [message, setMessage] = useState('');
  const [confetti, setConfetti] = useState(false);
  const [bet, setBet] = useState(50);
  const [streak, setStreak] = useState(0);

  // Sounds
  const [playWin] = useSound('/sounds/win.mp3', { volume: 0.5 });
  const [playLose] = useSound('/sounds/lose.mp3', { volume: 0.5 });
  const [playClick] = useSound('/sounds/click.mp3', { volume: 0.5 });

  const handleGuess = (guess: 'higher' | 'lower') => {
    if (bet <= 0 || bet > coins) {
      setMessage('Invalid bet!');
      return;
    }
    playClick();

    const next = getRandomCard();
    const win =
      (guess === 'higher' && next.value > currentCard.value) ||
      (guess === 'lower' && next.value < currentCard.value);

    if (win) {
      const reward = bet + streak * 20; // streak bonus
      setCoins(prev => prev + reward);
      setMessage(`Correct! +${reward} coins (Streak: ${streak + 1})`);
      setStreak(prev => prev + 1);
      setConfetti(true);
      playWin();
      setTimeout(() => setConfetti(false), 2000);
    } else {
      const loss = bet;
      setCoins(prev => Math.max(prev - loss, 0));
      setMessage(`Wrong! -${loss} coins`);
      setStreak(0);
      playLose();
    }
    setCurrentCard(next);
  };

  const handleReset = () => {
    setCoins(1000);
    setCurrentCard(getRandomCard());
    setMessage('');
    setStreak(0);
  };

  return (
    <Box sx={{ background: '#111', minHeight: '100vh', color: '#0ff', p: 3, fontFamily: 'monospace', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {confetti && <Confetti numberOfPieces={200} />}
      <Typography variant="h4" sx={{ mb: 2, textShadow: '0 0 10px #0ff' }}>High-Low Game</Typography>
      <Typography sx={{ mb: 2 }}>Coins: {coins}</Typography>
      <TextField
        type="number"
        label="Bet Amount"
        value={bet}
        onChange={e => setBet(Number(e.target.value))}
        sx={{ mb: 2, width: 120 }}
        inputProps={{ min: 1, max: coins }}
      />

      <Box sx={{ border: '2px solid #0ff', borderRadius: '10px', p: 4, mb: 2, minWidth: 120, minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', textShadow: '0 0 10px #0ff' }}>
        {cardName(currentCard.value)} {currentCard.suit}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="contained" color="success" onClick={() => handleGuess('higher')}>Higher</Button>
        <Button variant="contained" color="error" onClick={() => handleGuess('lower')}>Lower</Button>
      </Box>

      {message && <Typography sx={{ mb: 2, fontWeight: 'bold', textShadow: '0 0 8px #0ff' }}>{message}</Typography>}

      <Button variant="outlined" onClick={handleReset}>Reset Game</Button>
    </Box>
  );
};

export default UpgradedHighLowGame;
