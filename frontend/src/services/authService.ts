import type { LoginResponse, User } from "../models/user";
import { ApiService } from "./apiService";

export class AuthService extends ApiService {

    async signup(userData: User){
        const response = await this.post("/signup", userData);
        return response;
      }
    
      async login(userData: { email: string; password: string }): Promise<LoginResponse>{
        return await this.post("/login", userData);
      }
    
      async logout() {
        const response = await this.post("/logout", {});
        return response;
      }

      async forgotPassword(email: string) {
        return await this.post("/forgot-password", { email });
      }
      
      async resetPassword(token: string, newPassword: string) {
        return await this.post("/reset-password", { token, newPassword });
      }
      

}

export const authService = new AuthService();
