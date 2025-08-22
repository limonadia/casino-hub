import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

interface RouletteWheelProps {
  winningNumber: number | null;
  spinning: boolean;
  onSpinEnd?: () => void;
}

const redNumbers = [
  1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36
];

const getColor = (n: number) => (n === 0 ? 'green' : redNumbers.includes(n) ? 'red' : 'black');

const RouletteWheel: React.FC<RouletteWheelProps> = ({ winningNumber, spinning, onSpinEnd }) => {
  const [rotation, setRotation] = useState(0);
  const [highlight, setHighlight] = useState<number | null>(null);

  useEffect(() => {
    if (spinning && winningNumber !== null) {
      const randomRotations = 5 + Math.random() * 5;
      const degreesPerNumber = 360 / 37;
      const targetRotation = 360 * randomRotations - winningNumber * degreesPerNumber;

      setRotation(targetRotation);

      const timer = setTimeout(() => {
        setHighlight(winningNumber);
        onSpinEnd && onSpinEnd();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setHighlight(null);
    }
  }, [spinning, winningNumber, onSpinEnd]);

  return (
    <Box
      sx={{
        width: 300,
        height: 300,
        borderRadius: '50%',
        border: '4px solid #0ff',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 3,
        backgroundColor: '#111',
        transition: 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)',
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {Array.from({ length: 37 }, (_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: '50%',
            height: 20,
            backgroundColor: getColor(i),
            transformOrigin: '100% 50%',
            transform: `rotate(${i * (360 / 37)}deg) translateX(50%)`,
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color: '#fff',
              fontWeight: 'bold',
              textShadow:
                highlight === i
                  ? '0 0 10px #0ff, 0 0 20px #0ff, 0 0 30px #0ff'
                  : 'none',
              animation: highlight === i ? 'flash 1s alternate infinite' : 'none',
            }}
          >
            {i}
          </Typography>
        </Box>
      ))}

      {/* Center */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: '#0ff',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 20px #0ff',
        }}
      >
        <Typography
          sx={{
            color: '#000',
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: '40px',
          }}
        >
          🎯
        </Typography>
      </Box>

      <style>
        {`
          @keyframes flash {
            0% { opacity: 0.6; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default RouletteWheel;
