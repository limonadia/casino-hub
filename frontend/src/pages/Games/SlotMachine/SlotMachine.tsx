import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import Reel from './Reel';
import SlotBackground from './SlotBackground';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import useSound from 'use-sound';

const allSymbols = ['🍒', '🍋', '🍉', '⭐', '7️⃣', '🍇'];

const winPatterns = [
  [0, 0, 0], // top
  [1, 1, 1], // middle
  [2, 2, 2], // bottom
  [0, 1, 2], // diagonal TL-BR
  [2, 1, 0], // diagonal BL-TR
];

const SlotMachine: React.FC = () => {
  const [reels, setReels] = useState<string[]>(['❓', '❓', '❓']);
  const [spinning, setSpinning] = useState(false);
  const [winHighlights, setWinHighlights] = useState<{ [key: number]: number[] }>({});
  const { width, height } = useWindowSize();

  // Sounds
  const [playSpin] = useSound('/sounds/spin.mp3', { volume: 0.5 });
  const [playWin] = useSound('/sounds/win.mp3', { volume: 0.7 });

  const handleSpin = () => {
    setSpinning(true);
    playSpin();

    // simulate API spin result
    const spun = Array.from({ length: 3 }, () => allSymbols[Math.floor(Math.random() * allSymbols.length)]);
    setTimeout(() => {
      setReels(spun);
      setSpinning(false);

      // check wins
      const highlights: { [key: number]: number[] } = {};
      winPatterns.forEach(pattern => {
        const first = spun[0]; // simplified single row check
        const isWin = pattern.every((row, idx) => spun[idx] === first);
        if (isWin) {
          pattern.forEach((row, idx) => {
            if (!highlights[idx]) highlights[idx] = [];
            highlights[idx].push(row);
          });
        }
      });
      setWinHighlights(highlights);
      if (Object.keys(highlights).length > 0) playWin();
    }, 1500);
  };

  return (
    
    <SlotBackground>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {reels.map((symbol, idx) => (
          <Box
          sx={{
            border: winHighlights[idx]?.length ? '3px solid #ff0' : '3px solid #0ff',
            boxShadow: winHighlights[idx]?.length
              ? '0 0 20px #ff0, 0 0 40px #ff0 inset'
              : '0 0 10px #0ff, 0 0 20px #0ff inset',
            borderRadius: 2,
            transition: 'all 0.3s ease',
          }}
        >
          <Reel
            key={idx}
            reelIndex={idx}
            symbol={symbol}
            spinning={spinning}
            highlightIndices={winHighlights[idx] || []}
          />
        </Box>
        ))}
      </Box>

      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
  {Object.entries(winHighlights).map(([reelIdx, rows]) =>
    rows.map(rowIdx => (
      <Box
        key={`${reelIdx}-${rowIdx}`}
        sx={{
          position: 'absolute',
          width: 100, // same as reel width
          height: 4,
          top: `${rowIdx * 100 + 48}px`, // center of symbol
          left: `${Number(reelIdx) * 110}px`, // include gap between reels
          backgroundColor: '#ff0',
          boxShadow: '0 0 10px #ff0, 0 0 20px #ff0',
          animation: 'flash 0.5s ease-in-out infinite alternate',
    '@keyframes flash': {
      '0%': { opacity: 0.6 },
      '100%': { opacity: 1 },
    },
        }}
      />
    ))
  )}
</Box>

      <Button
        variant="contained"
        onClick={handleSpin}
        sx={{
          mt: 3,
          background: 'linear-gradient(to right, #0ff, #0f0)',
          color: '#000',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          boxShadow: '0 0 10px #0ff, 0 0 20px #0f0 inset',
          '&:hover': { background: 'linear-gradient(to right, #0f0, #0ff)' },
        }}
      >
        SPIN
      </Button>

      <Confetti
        width={width}
        height={height}
        numberOfPieces={winHighlights ? 200 : 0}
        recycle={false}
      />
    </SlotBackground>
  );
};

export default SlotMachine;
