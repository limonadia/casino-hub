import { ApiService } from "./apiService";
export class KenoService extends ApiService {
    async play(selectedNumbers: number[], bet: number){
        console.log("selected numbers", selectedNumbers)
        console.log("bet", bet)

        return await this.post("/keno/play", { selectedNumbers, bet })
    }
}

export const kenoService = new KenoService();

