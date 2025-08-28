import type { BlackjackState, Card } from "../models/blackjackModel";
import { ApiService } from "./apiService";

export class BlackJackService extends ApiService {
    async startGame(bet: number, coins: number): Promise<BlackjackState> {
        return await this.post<BlackjackState, { bet: number; coins: number }>(
          "/blackjack/start",
          { bet, coins }
        );
      }
    
      async hit(deck: Card[], playerCards: Card[], coins: number, bet: number, dealerCards: Card[]): Promise<BlackjackState> {
        return await this.post<BlackjackState, { deck: Card[]; playerCards: Card[]; coins: number; bet: number; dealerCards: Card[] }>(
          "/blackjack/hit",
          { deck, playerCards, coins, bet, dealerCards }
        );
      }
    
      async stand(deck: Card[], playerCards: Card[], dealerCards: Card[], coins: number, bet: number): Promise<BlackjackState> {
        return await this.post<BlackjackState, { deck: Card[]; playerCards: Card[]; dealerCards: Card[]; coins: number; bet: number }>(
          "/blackjack/stand",
          { deck, playerCards, dealerCards, coins, bet }
        );
      }
}

export const blackJackService = new BlackJackService();