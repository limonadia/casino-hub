import React from 'react';
import { Box } from '@mui/material';
import RouletteNumber from './RouletteNumber';

interface RouletteBoardProps {
  selectedNumbers: number[];
  onSelect: (num: number) => void;
}

const RouletteBoard: React.FC<RouletteBoardProps> = ({ selectedNumbers, onSelect }) => {
  const numbers = Array.from({ length: 37 }, (_, i) => i);
  const redNumbers = [
    1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36
  ];

  const getColor = (n: number) => (n === 0 ? 'green' : redNumbers.includes(n) ? 'red' : 'black');

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 50px)',
        gap: 2,
        justifyContent: 'center',
        mb: 3,
      }}
    >
      {numbers.map(num => (
        <RouletteNumber
          key={num}
          number={num}
          color={getColor(num)}
          selected={selectedNumbers.includes(num)}
          onClick={onSelect}
        />
      ))}
    </Box>
  );
};

export default RouletteBoard;
