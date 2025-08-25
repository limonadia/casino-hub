import type { User } from "../models/user";
import { ApiService } from "./apiService";

export class AuthService extends ApiService {

    async signup(userData: User){
        const response = await this.post("/signup", userData);
        return response;
      }
    
      async login(userData: { email: string; password: string }){
        const response = await this.post("/login", userData);
        return response;
      }
    
      async logout() {
        const response = await this.post("/logout", {});
        return response;
      }

}

export const authService = new AuthService();
