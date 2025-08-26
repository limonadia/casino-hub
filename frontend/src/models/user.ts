import type { BaseModel } from "./baseModel";

export interface User extends BaseModel{
    id?: number;
    username: string;    
    email: string;
    name?: string;
    score?: number;
    balance: number;
    experience?: number;
    freeSpins?: number;
    lastActive?: Date;
    password: string;
    lastFreeCoins?: string;
}

export interface LoginResponse {
    token: string;
  }
