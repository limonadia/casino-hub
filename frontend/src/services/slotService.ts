import type { SpinRequest, SpinResult } from "../models/slot";
import { ApiService } from "./apiService";

export class SlotService extends ApiService {

  spin = async (request: SpinRequest): Promise<SpinResult> => {
    return this.post("/slot/spin", request);
  };

}

export const slotService = new SlotService();
