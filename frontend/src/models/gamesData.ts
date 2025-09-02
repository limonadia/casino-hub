import slot1 from "/games/Slot.png";
import slot2 from "../assets/closeup-slot-machine-with-pink-blue-lights_1282444-127645.avif";
import blackjack from "/games/Blackjack.png";
import roulette from "/games/Roulette.png";
import baccarat from "/games/Baccarat.png";
import keno from "/games/Keno.png";
import hi_lo from "/games/HiLo.png";

export const gamesData = [
  { title: "Royal Slots", path: "/games/slot", imgSrc: slot2 },
  { title: "Blackjack", path: "/games/blackjack", imgSrc: blackjack },
  { title: "Roulette", path: "/games/roulette", imgSrc: roulette },
  { title: "Baccarat", path: "/games/baccarat", imgSrc: baccarat },
  { title: "Winner Slots", path: "/games/progressiveSlot", imgSrc: slot1 },
  { title: "Keno", path: "/games/keno", imgSrc: keno },
  { title: "Hi-Lo", path: "/games/hiLo", imgSrc: hi_lo },
];

export interface Game {
  id: string;
  title: string;
}

export interface RecentGame {
  imgSrc: string;
  title: string;
  playedAt: string; 
}
