import type { RecentGame } from "../models/gamesData";
import type { User } from "../models/user";
import { ApiService } from "./apiService";

export class UserService extends ApiService {

    async getProfile():Promise<User>{
        return await this.get("/users/profile");
      }
    
      async updateBalance(amount: number): Promise<number> {
        const response = await this.put<{ balance: number }, { amount: number }>("/balance", { amount });
        return response.balance;
      }

      async toggleFavourite(gameName: string) {
        return await this.post("/favourites/toggle", { gameName });
      }
      
      async getRecentGames(): Promise<RecentGame[]> {
        return await this.get("/recent/games");
      }

      async claimCash(){
        return await this.post('/promotions/daily-cash', {})
      }

      async spinWheel(){
        return await this.post('/promotions/spin-wheel', {})
      }
}

export const userService = new UserService();
