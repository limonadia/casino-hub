import React from 'react';
import { Box, Typography } from '@mui/material';

interface RouletteNumberProps {
  number: number;
  color: 'red' | 'black' | 'green';
  selected: boolean;
  onClick: (num: number) => void;
}

const RouletteNumber: React.FC<RouletteNumberProps> = ({ number, color, selected, onClick }) => {
  return (
    <Box
      onClick={() => onClick(number)}
      sx={{
        width: 50,
        height: 50,
        backgroundColor: color === 'red' ? '#c00' : color === 'black' ? '#111' : '#0c0',
        border: selected ? '3px solid #0ff' : '1px solid #0ff',
        borderRadius: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        color: '#fff',
        fontWeight: 'bold',
        boxShadow: selected ? '0 0 15px #0ff' : '0 0 5px #0ff',
        '&:hover': { transform: 'scale(1.1)', transition: '0.2s' },
      }}
    >
      <Typography>{number}</Typography>
    </Box>
  );
};

export default RouletteNumber;
