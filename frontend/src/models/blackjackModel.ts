export interface Card {
    suit: '♠' | '♥' | '♦' | '♣';
    value: string;
    numValue: number;
  }
  
  export interface BlackjackState {
    playerCards: Card[];
    dealerCards: Card[];
    deck: Card[];
    coins: number;
    bet: number;
    message: string;
    gameOver: boolean;
    winAmount?: number;
  }