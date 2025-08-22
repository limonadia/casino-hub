import type { Card, Suit, Rank } from './types';

const suits: Suit[] = ['♠', '♥', '♦', '♣'];
const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  suits.forEach(suit => {
    ranks.forEach(rank => deck.push({ suit, rank }));
  });
  return shuffle(deck);
};

export const shuffle = (deck: Card[]): Card[] => {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
};

export const getCardValue = (card: Card): number => {
  if (card.rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  return Number(card.rank);
};

export const calculateScore = (cards: Card[]): number => {
  let total = 0;
  let aceCount = 0;
  cards.forEach(card => {
    total += getCardValue(card);
    if (card.rank === 'A') aceCount++;
  });

  // Adjust for aces
  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount--;
  }
  return total;
};
