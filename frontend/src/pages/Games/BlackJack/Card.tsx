import React from 'react';
import type { Card as CardType } from './types';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface CardProps {
  card: CardType;
  hidden?: boolean;
}

const Card: React.FC<CardProps> = ({ card, hidden = false }) => {
  return (
    <motion.div
      initial={{ rotateY: hidden ? 180 : 0 }}
      animate={{ rotateY: hidden ? 180 : 0 }}
      transition={{ duration: 0.6 }}
      style={{ perspective: 600 }}
    >
      <Box
        sx={{
          width: 60,
          height: 90,
          borderRadius: 2,
          backgroundColor: hidden ? '#333' : '#111',
          border: '2px solid #0ff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 1,
          marginRight: 1,
          color: card.suit === '♥' || card.suit === '♦' ? 'red' : '#0ff',
          boxShadow: hidden
            ? '0 0 10px rgba(0,0,0,0.5)'
            : '0 0 10px #0ff, 0 0 20px #0ff inset',
          transformStyle: 'preserve-3d',
        }}
      >
        {!hidden && (
          <>
            <Typography variant="body2">{card.rank}</Typography>
            <Typography variant="body2" sx={{ alignSelf: 'flex-end' }}>
              {card.suit}
            </Typography>
          </>
        )}
      </Box>
    </motion.div>
  );
};

export default Card;
