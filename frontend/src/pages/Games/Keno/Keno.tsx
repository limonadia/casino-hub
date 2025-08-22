import React, { useState } from 'react';
import { Box, Button, Typography, Select, MenuItem } from '@mui/material';
import Confetti from 'react-confetti';
import useSound from 'use-sound';
import type { KenoNumber } from './types';
import drawSound from '/sounds/win.mp3';
import hitSound from '/sounds/spin.mp3';
import jackpotSound from '/sounds/win.mp3';

const totalNumbers = 80;
const jackpotBase = 5000;

const Keno: React.FC = () => {
  const [numbers, setNumbers] = useState<KenoNumber[]>(
    Array.from({ length: totalNumbers }, (_, i) => ({
      value: i + 1,
      selected: false,
      hit: false,
    }))
  );
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [coins, setCoins] = useState(1000);
  const [jackpot, setJackpot] = useState(jackpotBase);
  const [bet, setBet] = useState(10);
  const [confetti, setConfetti] = useState(false);

  const [playDraw] = useSound(drawSound);
  const [playHit] = useSound(hitSound);
  const [playJackpot] = useSound(jackpotSound);

  const toggleSelect = (num: number) => {
    setNumbers(prev =>
      prev.map(n => (n.value === num ? { ...n, selected: !n.selected } : n))
    );
  };

  const drawNumbers = () => {
    const selectedNumbers = numbers.filter(n => n.selected).map(n => n.value);
    if (selectedNumbers.length === 0) {
      setMessage('Pick at least 1 number!');
      return;
    }

    if (coins < bet) {
      setMessage('Not enough coins!');
      return;
    }

    setCoins(prev => prev - bet);
    setMessage('');
    playDraw();

    // Draw 20 random numbers
    const drawn: number[] = [];
    while (drawn.length < 20) {
      const rand = Math.floor(Math.random() * totalNumbers) + 1;
      if (!drawn.includes(rand)) drawn.push(rand);
    }
    setDrawnNumbers(drawn);

    // Check hits
    let hits = 0;
    setNumbers(prev =>
      prev.map(n => {
        if (n.selected && drawn.includes(n.value)) {
          hits++;
          return { ...n, hit: true };
        }
        return { ...n, hit: false };
      })
    );

    let payout = hits * bet; // 1:1 payout per hit
    if (hits >= 10) {
      payout += jackpot;
      setCoins(prev => prev + payout);
      setMessage(`🎉 JACKPOT! You hit ${hits} numbers and won ${payout}!`);
      setConfetti(true);
      playJackpot();
      setJackpot(jackpotBase); // reset jackpot
      setTimeout(() => setConfetti(false), 5000);
      return;
    }

    if (hits > 0) {
      setCoins(prev => prev + payout);
      setMessage(`You hit ${hits} numbers and won ${payout} coins!`);
      playHit();
    }

    // Increase progressive jackpot slightly
    setJackpot(prev => prev + Math.floor(bet * 0.1));
  };

  return (
    <Box sx={{ background: '#111', minHeight: '100vh', color: '#0ff', p: 3, fontFamily: 'monospace' }}>
      {confetti && <Confetti numberOfPieces={300} />}
      <Typography variant="h4" sx={{ mb: 2, textShadow: '0 0 10px #0ff' }}>Keno Progressive</Typography>
      <Typography sx={{ mb: 2 }}>Coins: {coins} | Jackpot: {jackpot}</Typography>

      <Box sx={{ mb: 2 }}>
        <Typography>Bet per round:</Typography>
        <Select value={bet} onChange={(e) => setBet(Number(e.target.value))}>
          {[10, 20, 50, 100].map(b => (
            <MenuItem key={b} value={b}>{b}</MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, 40px)', gap: 1, mb: 2 }}>
        {numbers.map(n => (
          <Box
            key={n.value}
            onClick={() => toggleSelect(n.value)}
            sx={{
              width: 35,
              height: 35,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '50%',
              cursor: 'pointer',
              userSelect: 'none',
              background: n.hit
                ? '#0f0'
                : n.selected
                ? 'rgba(0,255,255,0.5)'
                : '#222',
              color: '#0ff',
              fontWeight: 'bold',
              textShadow: n.hit ? '0 0 10px #0f0' : '0 0 5px #0ff',
            }}
          >
            {n.value}
          </Box>
        ))}
      </Box>

      <Button variant="contained" onClick={drawNumbers}>Draw Numbers</Button>

      {message && <Typography sx={{ mt: 2, textShadow: '0 0 10px #0ff' }}>{message}</Typography>}

      {drawnNumbers.length > 0 && (
        <Typography sx={{ mt: 1 }}>
          Drawn Numbers: {drawnNumbers.join(', ')}
        </Typography>
      )}
    </Box>
  );
};

export default Keno;
