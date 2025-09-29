import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { userService } from "./userService";
import type { User } from "../models/user";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  balance: number;
  setBalance: (balance: number) => void;
  updateBalance: (amount: number) => Promise<void>;
  refreshBalance: () => Promise<void>;
  isUpdatingBalance: boolean;
  user: User | null;
  setUser: (user: User | null | ((prevUser: User | null) => User | null)) => void; 
  isLoading: boolean; // Add this to the interface
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [balance, setBalance] = useState(0);
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);
  const [user, setUser] = useState<User | null>(null); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedToken = localStorage.getItem('token'); 
        
        if (storedToken) {
          const userData = await userService.getProfile();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!token) {
        setBalance(0);
        setUser(null); 
        return;
      }
      
      try {
        const profile = await userService.getProfile();
        setBalance(profile.balance);
        setUser(profile);
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }
    };
    fetchBalance();
  }, [token]);
  

  const updateBalance = async (amount: number): Promise<void> => {
    try {
      setIsUpdatingBalance(true);
      await userService.updateBalance(amount);
      setBalance(prev => prev + amount);       
    } catch (err) {
      console.error("Failed to update balance:", err);
      throw err;
    } finally {
      setIsUpdatingBalance(false);
    }
  };
  
  const refreshBalance = async (): Promise<void> => {
    if (!token) return;
    
    try {
      const profile = await userService.getProfile();
      setBalance(profile.balance);
      setUser(profile);
    } catch (err) {
      console.error("Failed to refresh balance:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      setToken, 
      balance, 
      setBalance,
      updateBalance,
      refreshBalance,
      isUpdatingBalance,
      user,
      setUser,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};