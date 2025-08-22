import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import Chip from './Chip';
import RouletteWheel from './RouletteWheel';
import RouletteNumber from './RouletteNumber';
import Confetti from 'react-confetti';
import useSound from 'use-sound';

interface Bet {
  number: number;
  amount: number;
  x: number;
  y: number;
  won?: boolean;
}

const redNumbers = [
  1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36
];

const getColor = (n: number) => (n === 0 ? 'green' : redNumbers.includes(n) ? 'red' : 'black');

const RouletteGame: React.FC = () => {
  const [coins, setCoins] = useState(100);
  const [bets, setBets] = useState<Bet[]>([]);
  const [betAmount, setBetAmount] = useState(10);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const [playSpin] = useSound('/sounds/spin.mp3', { volume: 0.5 });
  const [playWin] = useSound('/sounds/win.mp3', { volume: 0.7 });

  const handleSelectNumber = (num: number) => {
    if (coins < betAmount) return;
    setBets(prev => [
      ...prev,
      { number: num, amount: betAmount, x: 150, y: 150 } // center for animation
    ]);
    setCoins(prev => prev - betAmount);
  };

  const spinWheel = () => {
    if (bets.length === 0) return;
    setSpinning(true);
    setShowConfetti(false);
    setMessage('');
    playSpin();

    setTimeout(() => {
      const result = Math.floor(Math.random() * 37);
      setWinningNumber(result);

      setBets(prev => prev.map(b => ({ ...b, won: b.number === result })));

      const wonAmount = bets.filter(b => b.number === result).reduce((sum, b) => sum + b.amount * 5, 0);
      if (wonAmount > 0) {
        playWin();
        setCoins(prev => prev + wonAmount);
        setShowConfetti(true);
      }

      setMessage(`Winning Number: ${result} (${getColor(result)})`);
      setSpinning(false);
      setBets([]);
    }, 3000);
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
        Neon Roulette
      </Typography>

      <Typography sx={{ mb: 2, fontSize: 18, textShadow: '0 0 10px #0ff' }}>
        Coins: {coins}
      </Typography>

      <Box sx={{ position: 'relative', width: 300, height: 300, marginBottom: 3 }}>
        <RouletteWheel winningNumber={winningNumber} spinning={spinning} onSpinEnd={() => setSpinning(false)} />

        {bets.map((b, idx) => (
          <Box
            key={idx}
            sx={{
              position: 'absolute',
              left: b.x,
              top: b.y,
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: b.won ? 'radial-gradient(circle, lime, #0f0)' : 'radial-gradient(circle, #0ff, #00a)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transform: 'translate(-50%, -50%) scale(0)',
              animation: 'fly 0.5s forwards',
              boxShadow: b.won ? '0 0 20px lime' : '0 0 10px #0ff',
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 'bold', textAlign: 'center', lineHeight: '30px' }}>💰</Typography>
          </Box>
        ))}

        <style>
          {`
            @keyframes fly {
              to { transform: translate(-50%, -50%) scale(1); }
            }
          `}
        </style>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mb: 2 }}>
        {Array.from({ length: 37 }, (_, i) => (
          <RouletteNumber
            key={i}
            number={i}
            color={getColor(i)}
            selected={false}
            onClick={handleSelectNumber}
          />
        ))}
      </Box>

      <Button variant="contained" onClick={spinWheel} disabled={spinning || bets.length === 0}>
        {spinning ? 'Spinning...' : 'Spin'}
      </Button>

      {message && <Typography sx={{ mt: 2, fontWeight: 'bold', textShadow: '0 0 10px #0ff' }}>{message}</Typography>}
    </Box>
  );
};

export default RouletteGame;
