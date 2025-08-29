

import { ApiService } from "./apiService";

export class ProgressiveSlotService extends ApiService {
    async play(bet: number, token: string){
        return await this.post("/progressiveSlot/play",{ bet, token })
    }
}

export const progressiveSlotService = new ProgressiveSlotService();