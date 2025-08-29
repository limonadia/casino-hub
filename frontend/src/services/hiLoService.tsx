import { ApiService } from "./apiService";
export class HiLoService extends ApiService {
    async play(guess: "higher" | "lower" | "tie", bet: number){
        return await this.post("/hilo/play", { guess, bet })
    }
}

export const hiloService = new HiLoService();

