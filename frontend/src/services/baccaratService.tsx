import { ApiService } from "./apiService";

export enum BetType {
    Player = "PLAYER",
    Banker = "BANKER",
    Tie = "TIE",
  }

export class BaccaratService extends ApiService {
    async playRound(type: BetType, amount: number, token: string){
        return await this.post("/baccarat/play",{ type, amount, token })
    }
}

export const baccaratService = new BaccaratService();
