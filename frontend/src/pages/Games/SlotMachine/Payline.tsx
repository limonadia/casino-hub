// Payline.tsx
import React from 'react';
import { Box } from '@mui/material';

interface PaylineProps {
  positions: { x: number; y: number }[]; // coordinates of winning symbols
}

const Payline: React.FC<PaylineProps> = ({ positions }) => {
  if (positions.length < 2) return null;

  const first = positions[0];
  const last = positions[positions.length - 1];

  return (
    <Box
      sx={{
        position: 'absolute',
        top: first.y,
        left: first.x,
        width: last.x - first.x + 80,
        height: 4,
        backgroundColor: 'magenta',
        borderRadius: 2,
        boxShadow: '0 0 10px magenta',
        zIndex: 10,
      }}
    />
  );
};

export default Payline;
