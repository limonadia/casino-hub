import { useEffect, useState } from "react";
import type { User } from "../../models/user";

function DailyCoins({ user }: { user: User }) {
  const [nextClaim, setNextClaim] = useState<string>("");

  useEffect(() => {
    if (user.lastFreeCoins) {
      const last = new Date(user.lastFreeCoins).getTime();
      const next = last + 24 * 60 * 60 * 1000; // +24h
      const diff = next - Date.now();

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setNextClaim(`Next free coins in ${hours}h ${mins}m`);
      } else {
        setNextClaim("✅ Free coins available now!");
      }
    } else {
      setNextClaim("✅ Free coins available now!");
    }
  }, [user.lastFreeCoins]);

  return (
    <div className="p-3 bg-gray-800 text-white rounded-lg">
      <p>Balance: {user.balance}</p>
      <p>{nextClaim}</p>
    </div>
  );
}

export default DailyCoins;
