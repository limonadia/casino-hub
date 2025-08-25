import type { SpinRequest, SpinResult } from "../models/slot";
import { ApiService } from "./apiService";

export class SlotService extends ApiService {
  constructor() {
    super({ baseURL: "http://localhost:8080/api/slot" }); 
  }

  spin = async (request: SpinRequest): Promise<SpinResult> => {
    return this.post<SpinResult, SpinRequest>("/spin", request);
  };

}

export const slotService = new SlotService();
