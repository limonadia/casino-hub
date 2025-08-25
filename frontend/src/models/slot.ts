export interface SpinRequest {
    playerId: string;
    betAmount: number;
  }
  
  export interface SpinResult {
    success: boolean;
    symbols: number[];    
    winAmount: number;
    newBalance: number;
    winType: string;
    jackpotWin: boolean;
    multiplier: number;
    message?: string;
  }
  