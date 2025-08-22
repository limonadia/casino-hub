import React from 'react';
import { Box } from '@mui/material';

const SlotBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(circle at center, #111 0%, #000 80%)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background:
            'repeating-linear-gradient(45deg, rgba(0,255,255,0.05) 0 5px, transparent 5px 10px)',
          animation: 'moveBG 10s linear infinite',
          zIndex: 0,
        },
        '@keyframes moveBG': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '200px 200px' },
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>{children}</Box>
    </Box>
  );
};

export default SlotBackground;
