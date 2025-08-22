export interface SymbolType {
    id: number;
    name: string;
    image: string; // path to image
    value: number; // payout value
  }
  
  export interface ReelProps {
    symbols: SymbolType[];
    spinning: boolean;
    stopIndex: number | null; // index to stop at
    onStop?: (symbol: SymbolType) => void;
  }
  