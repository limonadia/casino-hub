import { ApiService } from "./apiService";

export type BetType =
  | { kind: 'number'; value: number }
  | { kind: 'color'; value: 'red' | 'black' }
  | { kind: 'parity'; value: 'odd' | 'even' }
  | { kind: 'dozen'; value: 1 | 2 | 3 }
  | { kind: 'column'; value: 1 | 2 | 3 };

// API enum
export enum BetEnum {
  Number = 'number',
  Color = 'color',
  OddEven = 'oddEven',
  Dozen = 'dozen',
  Column = 'column',
}
  
export class RouletteService extends ApiService {
    async spin(bet: BetType, stake: number) {
        return this.post("/roulette/spin", { bet, stake });
    }
}

export const rouletteService = new RouletteService();
