import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

type BetType = 'Player' | 'Banker' | 'Tie';

interface Card {
  suit: string;
  value: number;
  display: string;
}

const suits = ['♠', '♥', '♦', '♣'];

const getCardValue = (val: number) => (val > 9 ? 0 : val);
const getCardDisplay = (val: number, suit: string) => {
  if (val === 1) return `A${suit}`;
  if (val === 11) return `J${suit}`;
  if (val === 12) return `Q${suit}`;
  if (val === 13) return `K${suit}`;
  return `${val}${suit}`;
};

const drawCard = (): Card => {
  const value = Math.floor(Math.random() * 13) + 1;
  const suit = suits[Math.floor(Math.random() * 4)];
  return { suit, value: getCardValue(value), display: getCardDisplay(value, suit) };
};

const BaccaratGame: React.FC = () => {
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [bankerCards, setBankerCards] = useState<Card[]>([]);
  const [bet, setBet] = useState<BetType | null>(null);
  const [message, setMessage] = useState('');
  const [coins, setCoins] = useState(100);

  const calculateTotal = (cards: Card[]) => cards.reduce((sum, c) => sum + c.value, 0) % 10;

  const placeBet = (betType: BetType) => {
    if (coins <= 0) return;
    setBet(betType);
    setMessage('');
    setPlayerCards([]);
    setBankerCards([]);

    // Initial 2 cards
    let pCards = [drawCard(), drawCard()];
    let bCards = [drawCard(), drawCard()];

    let playerTotal = calculateTotal(pCards);
    let bankerTotal = calculateTotal(bCards);

    // Third card rules
    // Natural 8 or 9
    if (playerTotal < 8 && bankerTotal < 8) {
      // Player draws if total <=5
      if (playerTotal <= 5) {
        const third = drawCard();
        pCards.push(third);
        playerTotal = calculateTotal(pCards);

        // Banker rules based on player's third card
        const ptc = third.value;
        if (
          (bankerTotal <= 2) ||
          (bankerTotal === 3 && ptc !== 8) ||
          (bankerTotal === 4 && ptc >= 2 && ptc <= 7) ||
          (bankerTotal === 5 && ptc >= 4 && ptc <= 7) ||
          (bankerTotal === 6 && ptc === 6 || ptc === 7)
        ) {
          const thirdB = drawCard();
          bCards.push(thirdB);
          bankerTotal = calculateTotal(bCards);
        }
      } else if (playerTotal >= 6 && playerTotal <= 7) {
        // Player stands
        if (bankerTotal <= 5) {
          bCards.push(drawCard());
          bankerTotal = calculateTotal(bCards);
        }
      }
    }

    setPlayerCards(pCards);
    setBankerCards(bCards);

    // Determine winner
    let winner: BetType;
    if (playerTotal > bankerTotal) winner = 'Player';
    else if (bankerTotal > playerTotal) winner = 'Banker';
    else winner = 'Tie';

    // Update coins
    if (betType === winner) {
      let winAmount = 10;
      if (winner === 'Tie') winAmount = 50;
      setCoins(prev => prev + winAmount);
      setMessage(`You win! ${winner} wins.`);
    } else {
      setCoins(prev => prev - 10);
      setMessage(`You lose! ${winner} wins.`);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#111',
        color: '#0ff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 3,
        fontFamily: 'monospace',
      }}
    >
      <Typography variant="h4" sx={{ mb: 2, textShadow: '0 0 10px #0ff' }}>
        Neon Baccarat
      </Typography>

      <Typography sx={{ mb: 2 }}>Coins: {coins}</Typography>

      <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
        <Box>
          <Typography sx={{ mb: 1, textAlign: 'center' }}>Player</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {playerCards.map((c, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 60,
                  height: 90,
                  backgroundColor: '#222',
                  border: '2px solid #0ff',
                  borderRadius: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: 'bold',
                  textShadow: '0 0 5px #0ff',
                }}
              >
                {c.display}
              </Box>
            ))}
          </Box>
        </Box>

        <Box>
          <Typography sx={{ mb: 1, textAlign: 'center' }}>Banker</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {bankerCards.map((c, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 60,
                  height: 90,
                  backgroundColor: '#222',
                  border: '2px solid #f0f',
                  borderRadius: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: 'bold',
                  textShadow: '0 0 5px #f0f',
                }}
              >
                {c.display}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={() => placeBet('Player')}>
          Bet Player
        </Button>
        <Button variant="contained" onClick={() => placeBet('Banker')}>
          Bet Banker
        </Button>
        <Button variant="contained" onClick={() => placeBet('Tie')}>
          Bet Tie
        </Button>
      </Box>

      {message && (
        <Typography sx={{ fontSize: 18, fontWeight: 'bold', textShadow: '0 0 10px #0ff' }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default BaccaratGame;
