// import { useAuth } from "./authContext";
import { ApiService } from "./apiService";

// interface KenoRequest {
//     selectedNumbers: number[];
//     bet: number;
//   }
  
//   interface KenoResponse {
//     drawnNumbers: number[];
//     hits: number;
//     payout: number;
//     jackpotWon: boolean;
//     newBalance: number;
//     message: string;
//   }
  
export class KenoService extends ApiService {
    async play(selectedNumbers: number[], bet: number){
        console.log("selected numbers", selectedNumbers)
        console.log("bet", bet)

        return await this.post("/keno/play", { selectedNumbers, bet })
    }
}

export const kenoService = new KenoService();

