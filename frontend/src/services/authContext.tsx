import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { userService } from "./userService";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  balance: number;
  setBalance: (balance: number) => void;
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

  useEffect(() => {
    const fetchBalance = async () => {
      if (!token) return;
      try {
        const profile = await userService.getProfile();
        setBalance(profile.balance);
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }
    };
    fetchBalance();
  }, [token]);
  return (
    <AuthContext.Provider value={{ token, setToken, balance, setBalance }}>
      {children}
    </AuthContext.Provider>
  );
};
