export const symbols = ['🍒', '🍋', '🍉', '⭐', '7️⃣', '🍇'];

export interface SlotResult {
  reels: string[];
  win: boolean;
}

// Simulate a spin API
export const spinAPI = async (): Promise<SlotResult> => {
  const reels = Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
  const win = reels[0] === reels[1] && reels[1] === reels[2];
  return new Promise(resolve => setTimeout(() => resolve({ reels, win }), 1000));
};
