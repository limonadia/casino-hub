import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import type { SymbolType, ReelProps } from './types';

interface ReelPropsExtended extends ReelProps {
  spinSpeed?: number;
}

const Reel: React.FC<ReelPropsExtended> = ({ symbols, spinning, stopIndex, onStop, spinSpeed = 80 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let interval: number;
    if (spinning) {
      interval = window.setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % symbols.length);
      }, spinSpeed);
    } else if (stopIndex !== null) {
      setCurrentIndex(stopIndex);
      if (onStop) onStop(symbols[stopIndex]);
    }
    return () => clearInterval(interval);
  }, [spinning, stopIndex]);

  const displaySymbols = [
    symbols[(currentIndex + symbols.length - 1) % symbols.length],
    symbols[currentIndex],
    symbols[(currentIndex + 1) % symbols.length],
  ];

  return (
    <Box
      sx={{
        width: 80,
        height: 200,
        overflow: 'hidden',
        border: '2px solid cyan',
        borderRadius: 2,
      }}
    >
      {displaySymbols.map((s, idx) => (
        <Box
          key={idx}
          sx={{
            height: 60,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#0ff',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            textShadow: spinning ? '0 0 20px #0ff' : '0 0 5px #0ff',
            filter: spinning ? 'blur(2px)' : 'none',
            transition: 'filter 0.2s, text-shadow 0.2s',
            background: 'var(--color-background-lighter)',
          }}
        >
          {s.name}
        </Box>
      ))}
    </Box>
  );
};

export default Reel;
