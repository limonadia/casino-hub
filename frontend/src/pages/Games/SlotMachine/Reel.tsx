import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

interface ReelProps {
  symbol: string;
  spinning: boolean;
  stopDelay?: number;
  highlight?: boolean;
  highlightIndices?: number[];
  reelIndex: number;
}

const allSymbols = ['🍒', '🍋', '🍉', '⭐', '7️⃣', '🍇'];

const Reel: React.FC<ReelProps> = ({ symbol, spinning, stopDelay = 0, highlightIndices = [], reelIndex }) => {
  return (
    <Box
      sx={{
        width: 100,
        height: 100,
        overflow: 'hidden',
        borderRadius: 8,
        backgroundColor: '#111',
        border: '3px solid #0ff',
        boxShadow: '0 0 10px #0ff, 0 0 20px #0ff inset',
        margin: '0 5px',
        position: 'relative',
      }}
    >
      {/* 3D tilt wrapper */}
      <Box
        sx={{
          transform: spinning ? 'rotateX(10deg) scale(1.05)' : 'rotateX(0deg)',
          transition: 'transform 0.3s ease',
        }}
      >
        <motion.div
          animate={
            spinning
              ? { y: [0, -allSymbols.length * 100] }
              : { y: 0 }
          }
          transition={
            spinning
              ? { repeat: Infinity, duration: 0.5, ease: 'linear' }
              : { duration: 0.5, ease: 'easeOut', delay: stopDelay }
          }
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: '2rem',
            textAlign: 'center',
            filter: spinning ? 'blur(4px)' : 'blur(0px)',
          }}
        >
          {allSymbols.map((s, idx) => {
            const isHighlighted = highlightIndices.includes(idx);
            return (
              <div
                key={idx}
                style={{
                  height: 100,
                  lineHeight: '100px',
                  textAlign: 'center',
                  color: isHighlighted ? '#ff0' : '#0ff',
                  textShadow: isHighlighted
                    ? '0 0 10px #ff0, 0 0 20px #ff0'
                    : '0 0 5px #0ff',
                }}
              >
                {s}
              </div>
            );
          })}
        </motion.div>

        {/* Overlay final symbol */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
            fontSize: '2rem',
            color: highlightIndices.includes(allSymbols.indexOf(symbol)) ? '#ff0' : '#fff',
            textShadow: highlightIndices.includes(allSymbols.indexOf(symbol))
              ? '0 0 10px #ff0, 0 0 20px #ff0'
              : '0 0 10px #0ff, 0 0 20px #0ff',
          }}
        >
          {symbol}
        </Box>
      </Box>
    </Box>
  );
};

export default Reel;
