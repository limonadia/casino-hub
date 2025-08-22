import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import Confetti from 'react-confetti';

interface ScratchCardProps {
  width?: number;
  height?: number;
  prizeAmounts?: number[];
}

const ScratchCard: React.FC<ScratchCardProps> = ({
  width = 300,
  height = 200,
  prizeAmounts = [0, 50, 100, 200, 500],
}) => {
    

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [coins, setCoins] = useState(1000);
  const [prize, setPrize] = useState<number | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [confetti, setConfetti] = useState(false);

  // Random prize for this card
  const [currentPrize, setCurrentPrize] = useState(
    prizeAmounts[Math.floor(Math.random() * prizeAmounts.length)]
  );

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill overlay
    ctx.fillStyle = '#888'; // gray scratch layer
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'destination-out'; // for scratching effect
  }, [width, height]);

  const handleMouseDown = () => setIsScratching(true);
  const handleMouseUp = () => {
    setIsScratching(false);
    checkReveal();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
  };

  const checkReveal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    let cleared = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] === 0) cleared++;
    }
    if (cleared / (width * height) > 0.4 && prize === null) {
      setPrize(currentPrize);
      setCoins(prev => prev + currentPrize);
      if (currentPrize > 0) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 4000);
      }
    }
  };

  const [cardKey, setCardKey] = useState(0);

const handlePlayAgain = () => {
  setPrize(null);
  setCurrentPrize(prizeAmounts[Math.floor(Math.random() * prizeAmounts.length)]);
  setCardKey(prev => prev + 1); // forces canvas to remount
};

  return (
    <Box sx={{ background: '#111', minHeight: '100vh', color: '#0ff', p: 3, fontFamily: 'monospace', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {confetti && <Confetti numberOfPieces={300} />}
      <Typography variant="h4" sx={{ mb: 2, textShadow: '0 0 10px #0ff' }}>Scratch Card</Typography>
      <Typography sx={{ mb: 2 }}>Coins: {coins}</Typography>

      <Box sx={{ position: 'relative', mb: 2 }}>
      <canvas
  key={cardKey} // 🔑 important
  ref={canvasRef}
  width={width}
  height={height}
  style={{ borderRadius: '10px', cursor: 'pointer', boxShadow: '0 0 10px #0ff' }}
  onMouseDown={handleMouseDown}
  onMouseUp={handleMouseUp}
  onMouseMove={handleMouseMove}
  onMouseLeave={handleMouseUp}
/>

        {prize !== null && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f0', textShadow: '0 0 15px #0f0' }}>
              🎉 {prize} Coins!
            </Typography>
          </Box>
        )}
      </Box>

      {prize !== null && <Button variant="contained" onClick={handlePlayAgain}>Play Again</Button>}
    </Box>
  );
};

export default ScratchCard;
