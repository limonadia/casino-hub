import React from 'react';
import { Box, Typography } from '@mui/material';

interface ChipProps {
  value: number;
  onClick: (value: number) => void;
}

const Chip: React.FC<ChipProps> = ({ value, onClick }) => {
  return (
    <Box
      onClick={() => onClick(value)}
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #0ff 0%, #00a 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        margin: 1,
        boxShadow: '0 0 10px #0ff',
        '&:hover': { transform: 'scale(1.1)', transition: '0.2s' },
      }}
    >
      <Typography sx={{ color: '#000', fontWeight: 'bold' }}>{value}</Typography>
    </Box>
  );
};

export default Chip;
