'use client'; // important for Client Component
import { useEffect, useState } from "react";
import DailyCoins from "../../components/DailyCoins/DailyCoins";
import { userService } from "../../services/userService";
import type { User } from "../../models/user";


 function Promotions() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    userService.getProfile().then(setUser);
  }, []);

  if (!user) return <div>Loading...</div>;

  return <DailyCoins user={user} />;
}

export default Promotions;