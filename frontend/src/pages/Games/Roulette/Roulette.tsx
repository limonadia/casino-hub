import React, { useState, useEffect } from 'react';

interface Bet {
  type: 'straight' | 'red' | 'black' | 'odd' | 'even' | 'low' | 'high' | 'dozen' | 'column';
  numbers: number[];
  amount: number;
  payout: number;
  position: { x: number; y: number };
  id: string;
}

const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const getColor = (n: number) => n === 0 ? 'green' : redNumbers.includes(n) ? 'red' : 'black';

// Roulette wheel numbers in correct order
const wheelNumbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RouletteWheel = ({ spinning, winningNumber, onSpinComplete }: {
  spinning: boolean;
  winningNumber: number | null;
  onSpinComplete: () => void;
}) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (spinning && winningNumber !== null) {
      const winningIndex = wheelNumbers.indexOf(winningNumber);
      const targetRotation = (360 / 37) * winningIndex + 360 * 5 + Math.random() * 20 - 10;
      setRotation(prev => prev + targetRotation);
      
      setTimeout(() => {
        onSpinComplete();
      }, 4000);
    }
  }, [spinning, winningNumber]);

  return (
    <div className="flex flex-col items-center mb-8">
      {/* Wheel Container */}
      <div className="relative w-80 h-80 mb-4">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 border-8 border-yellow-400 shadow-2xl">
          {/* Static number ring */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-900 to-amber-800 border-4 border-amber-600">
            {wheelNumbers.map((number, index) => {
              const angle = (360 / 37) * index;
              const color = getColor(number);
              const radians = (angle * Math.PI) / 180;
              const radius = 120;
              const x = Math.cos(radians - Math.PI/2) * radius;
              const y = Math.sin(radians - Math.PI/2) * radius;
              
              return (
                <div
                  key={`${number}-${index}`}
                  className={`absolute w-8 h-8 flex items-center justify-center text-white font-bold text-xs rounded ${
                    color === 'red' ? 'bg-red-600 border border-red-400' : 
                    color === 'black' ? 'bg-gray-900 border border-gray-600' : 
                    'bg-green-600 border border-green-400'
                  }`}
                  style={{
                    left: `calc(50% + ${x}px - 16px)`,
                    top: `calc(50% + ${y}px - 16px)`,
                    transform: `rotate(${angle}deg)`
                  }}
                >
                  {number}
                </div>
              );
            })}
            
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-yellow-300 shadow-inner flex items-center justify-center">
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-500 ${spinning ? 'animate-spin' : ''}`}
              />
            </div>
          </div>
          
          {/* Ball indicator */}
          <div
            className={`absolute top-8 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-gray-300 z-10 transition-transform duration-[4000ms] ease-out ${spinning ? 'animate-pulse' : ''}`}
            style={{
              transform: spinning ? `translateX(-50%) rotate(${rotation}deg)` : 'translateX(-50%)'
            }}
          />
        </div>
      </div>
      
      {/* Winning number display */}
      {winningNumber !== null && !spinning && (
        <div
          className={`text-center bg-black/70 rounded-xl p-4 border-2 border-yellow-400 transform transition-all duration-500 ${!spinning ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        >
          <div className={`text-4xl font-bold mb-1 ${
            getColor(winningNumber) === 'red' ? 'text-red-400' : 
            getColor(winningNumber) === 'black' ? 'text-white' : 'text-green-400'
          }`}>
            {winningNumber}
          </div>
          <div className="text-yellow-300 font-semibold capitalize text-sm">
            {getColor(winningNumber)}
          </div>
        </div>
      )}
    </div>
  );
};

const ChipComponent = ({ value, selected, onClick }: {
  value: number;
  selected: boolean;
  onClick: (value: number) => void;
}) => (
  <button
    onClick={() => onClick(value)}
    className={`relative w-12 h-12 rounded-full border-4 font-bold text-sm shadow-lg transform transition-all duration-200 hover:scale-110 active:scale-95 ${
      selected 
        ? 'border-yellow-400 bg-gradient-to-br from-yellow-300 to-yellow-500 text-black' 
        : value === 5 ? 'border-red-400 bg-gradient-to-br from-red-500 to-red-700 text-white'
        : value === 25 ? 'border-green-400 bg-gradient-to-br from-green-500 to-green-700 text-white'
        : value === 100 ? 'border-black bg-gradient-to-br from-gray-800 to-black text-white'
        : value === 500 ? 'border-purple-400 bg-gradient-to-br from-purple-500 to-purple-700 text-white'
        : 'border-blue-400 bg-gradient-to-br from-blue-500 to-blue-700 text-white'
    }`}
  >
    {value}
    {/* Chip pattern */}
    <div className="absolute inset-2 rounded-full border border-white/30" />
    <div className="absolute inset-3 rounded-full border border-white/20" />
  </button>
);

const BettingSpot = ({ children, onClick, className = "" }: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <div
    onClick={onClick}
    className={`relative cursor-pointer transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-98 ${className}`}
  >
    {children}
  </div>
);

const CasinoRoulette = () => {
  const [coins, setCoins] = useState(5000);
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(25);
  const [spinning, setSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [message, setMessage] = useState('Place your bets!');
  const [showWin, setShowWin] = useState(false);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [gameHistory, setGameHistory] = useState<number[]>([]);
  const [lastWinPositions, setLastWinPositions] = useState<string[]>([]);

  const playSound = (type: string) => {
    console.log(`Playing ${type} sound`);
  };

  const placeBet = (type: Bet['type'], numbers: number[], payout: number, position: { x: number; y: number }) => {
    if (coins < selectedChip || spinning) return;
    
    const betId = `${type}-${numbers.join('-')}-${Date.now()}`;
    const newBet: Bet = {
      type,
      numbers,
      amount: selectedChip,
      payout,
      position,
      id: betId
    };
    
    setBets(prev => [...prev, newBet]);
    setCoins(prev => prev - selectedChip);
    playSound('chip');
  };

  const placeStraightBet = (number: number) => {
    placeBet('straight', [number], 35, { x: 0, y: 0 });
  };

  const placeOutsideBet = (type: Bet['type'], numbers: number[], payout: number) => {
    placeBet(type, numbers, payout, { x: 0, y: 0 });
  };

  const spinWheel = () => {
    if (bets.length === 0 || spinning) return;
    
    setSpinning(true);
    setMessage('Spinning...');
    setWinningNumber(null);
    setShowWin(false);
    playSound('spin');
    
    // Generate winning number
    const result = Math.floor(Math.random() * 37);
    setWinningNumber(result);
    setGameHistory(prev => [result, ...prev.slice(0, 9)]);
  };

  const onSpinComplete = () => {
    if (winningNumber === null) return;
    
    let totalWinAmount = 0;
    const winningBets: string[] = [];
    
    bets.forEach(bet => {
      if (bet.numbers.includes(winningNumber)) {
        const winAmount = bet.amount * (bet.payout + 1);
        totalWinAmount += winAmount;
        winningBets.push(bet.id);
      }
    });
    
    if (totalWinAmount > 0) {
      setCoins(prev => prev + totalWinAmount);
      setTotalWinnings(totalWinAmount);
      setShowWin(true);
      setMessage(`🎉 Number ${winningNumber} (${getColor(winningNumber).toUpperCase()}) wins ${totalWinAmount} coins! 🎉`);
      playSound('win');
      setTimeout(() => setShowWin(false), 3000);
    } else {
      setMessage(`Number ${winningNumber} (${getColor(winningNumber).toUpperCase()}). Better luck next time!`);
    }
    
    setLastWinPositions(winningBets);
    setSpinning(false);
    
    // Clear bets after 3 seconds
    setTimeout(() => {
      setBets([]);
      setLastWinPositions([]);
      setMessage('Place your bets!');
    }, 3000);
  };

  const clearBets = () => {
    const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
    setCoins(prev => prev + totalBetAmount);
    setBets([]);
  };

  // Generate number grid (1-36 in roulette layout)
  const numberGrid: number[][] = [];
  for (let row = 0; row < 3; row++) {
    const rowNumbers = [];
    for (let col = 0; col < 12; col++) {
      const number = (col * 3) + (3 - row);
      rowNumbers.push(number);
    }
    numberGrid.push(rowNumbers);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-green-800 to-red-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffd700' fill-opacity='0.1'%3E%3Ccircle cx='40' cy='40' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Win Animation */}
      {showWin && (
        <div
          className={`fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50 text-center transition-all duration-500 ${showWin ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        >
          <div className="bg-black/80 rounded-2xl p-8 border-4 border-yellow-400">
            <div className="text-6xl font-bold text-yellow-400 mb-4 animate-bounce">
              🎰 BIG WIN! 🎰
            </div>
            <div className="text-4xl text-green-400 font-bold">
              +{totalWinnings} COINS!
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 
            className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 mb-2 animate-pulse"
          >
            EUROPEAN ROULETTE
          </h1>
          <div className="text-xl text-yellow-200">Single Zero • House Edge 2.7%</div>
        </div>

        {/* Game Stats */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-6 bg-black/40 rounded-xl p-4 border border-yellow-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{coins.toLocaleString()}</div>
              <div className="text-sm text-gray-300">COINS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{bets.reduce((sum, bet) => sum + bet.amount, 0)}</div>
              <div className="text-sm text-gray-300">TOTAL BETS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{bets.length}</div>
              <div className="text-sm text-gray-300">ACTIVE BETS</div>
            </div>
          </div>
        </div>

        {/* Roulette Wheel */}
        <RouletteWheel 
          spinning={spinning} 
          winningNumber={winningNumber} 
          onSpinComplete={onSpinComplete}
        />

        {/* Game Message */}
        <div className="text-center mb-6">
          <div
            className={`text-2xl font-bold text-yellow-300 min-h-8 transition-all duration-500 ${message.includes('wins') ? 'text-green-400 animate-pulse' : ''}`}
          >
            {message}
          </div>
        </div>

        {/* Recent Numbers */}
        {gameHistory.length > 0 && (
          <div className="flex justify-center mb-6">
            <div className="bg-black/40 rounded-xl p-4 border border-yellow-500/30">
              <div className="text-white font-semibold mb-2 text-center">RECENT NUMBERS</div>
              <div className="flex gap-2">
                {gameHistory.map((num, index) => (
                  <div
                    key={index}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 transition-all duration-300 ${
                      getColor(num) === 'red' ? 'bg-red-600 border-red-400' :
                      getColor(num) === 'black' ? 'bg-gray-900 border-gray-600' :
                      'bg-green-600 border-green-400'
                    } ${index === 0 ? 'ring-2 ring-yellow-400 scale-110' : ''}`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Betting Table */}
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-green-700 to-green-800 rounded-2xl border-4 border-yellow-600 shadow-2xl p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Main betting area */}
            <div className="flex-1">
              {/* Zero */}
              <div className="mb-2 flex justify-center">
                <BettingSpot
                  onClick={() => placeStraightBet(0)}
                  className="inline-block"
                >
                  <div className="w-16 h-12 bg-green-600 border-2 border-white flex items-center justify-center text-white font-bold text-lg rounded hover:bg-green-500">
                    0
                  </div>
                </BettingSpot>
              </div>

              {/* Number Grid */}
              <div className="mb-2">
                {numberGrid.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex">
                    {row.map(number => (
                      <BettingSpot
                        key={number}
                        onClick={() => placeStraightBet(number)}
                        className="flex-1"
                      >
                        <div className={`h-12 border border-white flex items-center justify-center text-white font-bold text-sm hover:opacity-80 ${
                          getColor(number) === 'red' ? 'bg-red-600' : 'bg-black'
                        }`}>
                          {number}
                        </div>
                      </BettingSpot>
                    ))}
                    {/* Column bet */}
                    <BettingSpot
                      onClick={() => placeOutsideBet('column', 
                        numberGrid[rowIndex], 2)}
                      className="ml-1"
                    >
                      <div className="w-12 h-12 bg-yellow-600 border border-white flex items-center justify-center text-black font-bold text-xs rounded hover:bg-yellow-500">
                        2:1
                      </div>
                    </BettingSpot>
                  </div>
                ))}
              </div>

              {/* Dozen bets */}
              <div className="flex gap-1 mb-2">
                <BettingSpot
                  onClick={() => placeOutsideBet('dozen', Array.from({length: 12}, (_, i) => i + 1), 2)}
                  className="flex-1"
                >
                  <div className="h-10 bg-yellow-600 border border-white flex items-center justify-center text-black font-bold text-sm rounded hover:bg-yellow-500">
                    1st 12
                  </div>
                </BettingSpot>
                <BettingSpot
                  onClick={() => placeOutsideBet('dozen', Array.from({length: 12}, (_, i) => i + 13), 2)}
                  className="flex-1"
                >
                  <div className="h-10 bg-yellow-600 border border-white flex items-center justify-center text-black font-bold text-sm rounded hover:bg-yellow-500">
                    2nd 12
                  </div>
                </BettingSpot>
                <BettingSpot
                  onClick={() => placeOutsideBet('dozen', Array.from({length: 12}, (_, i) => i + 25), 2)}
                  className="flex-1"
                >
                  <div className="h-10 bg-yellow-600 border border-white flex items-center justify-center text-black font-bold text-sm rounded hover:bg-yellow-500">
                    3rd 12
                  </div>
                </BettingSpot>
              </div>

              {/* Even money bets */}
              <div className="grid grid-cols-6 gap-1">
                <BettingSpot onClick={() => placeOutsideBet('low', Array.from({length: 18}, (_, i) => i + 1), 1)}>
                  <div className="h-10 bg-yellow-600 border border-white flex items-center justify-center text-black font-bold text-xs rounded hover:bg-yellow-500">
                    1-18
                  </div>
                </BettingSpot>
                <BettingSpot onClick={() => placeOutsideBet('even', Array.from({length: 18}, (_, i) => (i + 1) * 2), 1)}>
                  <div className="h-10 bg-yellow-600 border border-white flex items-center justify-center text-black font-bold text-xs rounded hover:bg-yellow-500">
                    EVEN
                  </div>
                </BettingSpot>
                <BettingSpot onClick={() => placeOutsideBet('red', redNumbers, 1)}>
                  <div className="h-10 bg-red-600 border border-white flex items-center justify-center text-white font-bold text-xs rounded hover:bg-red-500">
                    RED
                  </div>
                </BettingSpot>
                <BettingSpot onClick={() => placeOutsideBet('black', Array.from({length: 36}, (_, i) => i + 1).filter(n => !redNumbers.includes(n)), 1)}>
                  <div className="h-10 bg-black border border-white flex items-center justify-center text-white font-bold text-xs rounded hover:bg-gray-800">
                    BLACK
                  </div>
                </BettingSpot>
                <BettingSpot onClick={() => placeOutsideBet('odd', Array.from({length: 18}, (_, i) => (i * 2) + 1), 1)}>
                  <div className="h-10 bg-yellow-600 border border-white flex items-center justify-center text-black font-bold text-xs rounded hover:bg-yellow-500">
                    ODD
                  </div>
                </BettingSpot>
                <BettingSpot onClick={() => placeOutsideBet('high', Array.from({length: 18}, (_, i) => i + 19), 1)}>
                  <div className="h-10 bg-yellow-600 border border-white flex items-center justify-center text-black font-bold text-xs rounded hover:bg-yellow-500">
                    19-36
                  </div>
                </BettingSpot>
              </div>
            </div>

            {/* Chip selector and controls */}
            <div className="lg:w-64">
              <div className="bg-black/40 rounded-xl p-4 border border-yellow-500/30 h-full">
                <div className="text-white font-bold mb-4 text-center">CHIPS</div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[5, 25, 100, 500].map(value => (
                    <ChipComponent
                      key={value}
                      value={value}
                      selected={selectedChip === value}
                      onClick={setSelectedChip}
                    />
                  ))}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={spinWheel}
                    disabled={bets.length === 0 || spinning}
                    className={`w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold rounded-xl border-2 border-green-400 shadow-lg hover:from-green-500 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${bets.length > 0 && !spinning ? 'hover:scale-105' : ''}`}
                  >
                    {spinning ? (
                      <span className="inline-block animate-spin">
                        🎰
                      </span>
                    ) : (
                      'SPIN'
                    )}
                  </button>

                  <button
                    onClick={clearBets}
                    disabled={bets.length === 0 || spinning}
                    className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-lg border border-red-400 hover:from-red-500 hover:to-red-700 disabled:opacity-50 transition-all duration-200"
                  >
                    CLEAR BETS
                  </button>
                </div>

                {/* Bet summary */}
                {bets.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <div className="text-white font-semibold mb-2 text-sm">ACTIVE BETS:</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {bets.map(bet => (
                        <div key={bet.id} className="text-xs text-gray-300 flex justify-between">
                          <span className="truncate">{bet.type.toUpperCase()}</span>
                          <span>{bet.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payouts table */}
        <div className="max-w-4xl mx-auto mt-8 bg-black/40 rounded-xl p-6 border border-yellow-500/30">
          <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-center">PAYOUTS</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="text-white">
              <div className="font-semibold text-yellow-300">Straight Up</div>
              <div>35:1</div>
            </div>
            <div className="text-white">
              <div className="font-semibold text-yellow-300">Dozen/Column</div>
              <div>2:1</div>
            </div>
            <div className="text-white">
              <div className="font-semibold text-yellow-300">Red/Black</div>
              <div>1:1</div>
            </div>
            <div className="text-white">
              <div className="font-semibold text-yellow-300">Odd/Even</div>
              <div>1:1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasinoRoulette;