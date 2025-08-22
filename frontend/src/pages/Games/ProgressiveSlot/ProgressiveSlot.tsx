import React, { useState } from 'react';
import { Box, Button, Typography, Modal } from '@mui/material';
import Reel from './Reel';
import type { SymbolType } from './types';
import Confetti from 'react-confetti';
import useSound from 'use-sound';
import spinSound from '/sounds/spin.mp3';
import winSound from '/sounds/win.mp3';
import jackpotSound from '/sounds/win.mp3';

const symbols: SymbolType[] = [
  { id: 1, name: '🍒', image: '', value: 10 },
  { id: 2, name: '🍋', image: '', value: 20 },
  { id: 3, name: '🔔', image: '', value: 50 },
  { id: 4, name: '💎', image: '', value: 100 },
  { id: 5, name: '⭐', image: '', value: 150 },
  { id: 6, name: '🎰', image: '', value: 500 },
  { id: 7, name: '💰', image: '', value: 0 }, // bonus symbol for mini-game
];

const ProgressiveSlot: React.FC = () => {
  const [spinning, setSpinning] = useState(false);
  const [reelStops, setReelStops] = useState<number[]>([0, 0, 0, 0, 0]);
  const [coins, setCoins] = useState(1000);
  const [jackpot, setJackpot] = useState(10000);
  const [message, setMessage] = useState('');
  const [freeSpins, setFreeSpins] = useState(0);
  const [showPickBox, setShowPickBox] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const [playSpin] = useSound(spinSound);
  const [playWin] = useSound(winSound);
  const [playJackpot] = useSound(jackpotSound);

  const spin = () => {
    if (spinning || coins < 10) return;

    const cost = freeSpins > 0 ? 0 : 10;
    setCoins(prev => prev - cost);
    if (freeSpins > 0) setFreeSpins(prev => prev - 1);

    setSpinning(true);
    setMessage('');
    playSpin();

    const stops = symbols.map(() => Math.floor(Math.random() * symbols.length));
    setReelStops(stops);

    setTimeout(() => {
      setSpinning(false);

      const middleSymbols = stops.map(i => symbols[i].id);
      const first = middleSymbols[0];
      const allSame = middleSymbols.every(id => id === first);

      // Bonus mini-game if 3 💰 symbols appear anywhere
      const bonusSymbols = middleSymbols.filter(id => id === 7).length;
      if (bonusSymbols >= 3) {
        setShowPickBox(true);
        return;
      }

      if (allSame) {
        const winAmount = symbols[first - 1].value;
        setCoins(prev => prev + winAmount);
        setJackpot(prev => prev - winAmount);
        setMessage(`You won ${winAmount}! 🎉`);
        playWin();
      }

      if (Math.random() < 0.01) {
        setCoins(prev => prev + jackpot);
        setMessage(`🎉 JACKPOT! You won ${jackpot}!`);
        setConfetti(true);
        playJackpot();
        setJackpot(5000);
        setTimeout(() => setConfetti(false), 5000);
      }

      // Free spins chance
      if (Math.random() < 0.1) {
        setFreeSpins(prev => prev + 2);
        setMessage(prev => prev + ' You won 2 free spins!');
      }
    }, 2000);
  };

  const pickBox = (amount: number) => {
    setCoins(prev => prev + amount);
    setMessage(`You picked ${amount} coins!`);
    setShowPickBox(false);
  };

  return (
    <Box sx={{ background: '#111', minHeight: '100vh', color: '#0ff', p: 3, fontFamily: 'monospace' }}>
      {confetti && <Confetti numberOfPieces={300} />}
      <Typography variant="h4" sx={{ mb: 2, textShadow: '0 0 10px #0ff' }}>Progressive Jackpot Slots</Typography>
      <Typography sx={{ mb: 2 }}>Coins: {coins} | Jackpot: {jackpot} | Free Spins: {freeSpins}</Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <Reel key={i} symbols={symbols} spinning={spinning} stopIndex={reelStops[i]} />
        ))}
      </Box>

      <Button variant="contained" onClick={spin} disabled={spinning}>
        {spinning ? 'Spinning...' : 'Spin'}
      </Button>

      {message && <Typography sx={{ mt: 2, textShadow: '0 0 10px #0ff' }}>{message}</Typography>}

      <Modal open={showPickBox} onClose={() => setShowPickBox(false)}>
        <Box
          sx={{
            background: '#222',
            color: '#0ff',
            width: 300,
            height: 200,
            mx: 'auto',
            mt: '20vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
          }}
        >
          <Typography sx={{ mb: 2 }}>Pick a box to win coins!</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {[50, 100, 200].map((amt, idx) => (
              <Button key={idx} variant="contained" onClick={() => pickBox(amt)}>
                {amt}
              </Button>
            ))}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ProgressiveSlot;
