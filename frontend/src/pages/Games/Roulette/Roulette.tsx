import type { ReactElement, JSXElementConstructor, ReactNode, ReactPortal , Key} from "react";

import React, { useEffect, useRef, useState } from "react";

// Define the interface for a bet
interface Bet {
  type: 'straight' | 'red' | 'black' | 'odd' | 'even' | 'low' | 'high' | 'dozen' | 'column';
  numbers: number[];
  amount: number;
  payout: number;
  id: string; // Unique ID for each bet instance
}

// Define red and black numbers for the roulette wheel
const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const getColor = (n: number) => n === 0 ? 'green' : redNumbers.includes(n) ? 'red' : 'black';

// Correct European roulette wheel order
const wheelNumbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// Roulette Wheel Component
const RouletteWheel = ({ spinning, winningNumber, onSpinComplete }: {
  spinning: boolean;
  winningNumber: number | null;
  onSpinComplete: () => void;
}) => {
  const [rotation, setRotation] = useState(0);
  const rotationOffsetRef = useRef(0);

  useEffect(() => {
    if (spinning && winningNumber !== null) {
      const winningIndex = wheelNumbers.indexOf(winningNumber);
      const segmentAngle = 360 / 37;
      
      // Calculate the final rotation to stop the wheel precisely on the winning number
      // We add a large number of full rotations (e.g., 5) for visual effect.
      // The offset is crucial: it positions the number's center directly under the pointer.
      const targetRotation = (360 * 5) + (segmentAngle * (37 - winningIndex));
      
      // Update the state with the new target rotation
      setRotation(targetRotation);
      
      // The `rotationOffsetRef` stores the current rotation so subsequent spins start from where the last one ended.
      rotationOffsetRef.current = targetRotation;
      
      // Call onSpinComplete after the animation duration (4s)
      setTimeout(() => {
        onSpinComplete();
      }, 4000);
    }
  }, [spinning, winningNumber, onSpinComplete]);

  return (
    <div className="flex flex-col items-center mb-6">
      {/* Wheel Container */}
      <div className="relative w-80 h-80 mb-4">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 border-8 border-yellow-400 shadow-[0_0_20px_rgba(255,255,0,0.5),_inset_0_0_10px_rgba(0,0,0,0.3)]">
          {/* Spinning wheel with numbers and segments */}
          <div 
            className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-900 to-amber-800 border-4 border-amber-600 transition-transform duration-[4000ms] ease-out shadow-inner"
            style={{
              transform: `rotate(${rotation}deg)`
            }}
          >
            {/* The SVG element to draw the segments */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 288 288">
              {wheelNumbers.map((number, index) => {
                const angle = (360 / 37) * index;
                const nextAngle = (360 / 37) * (index + 1);
                const color = getColor(number);
                
                const startAngleRad = (angle * Math.PI) / 180;
                const endAngleRad = (nextAngle * Math.PI) / 180;
                
                const x1 = 144 + Math.cos(startAngleRad) * 100;
                const y1 = 144 + Math.sin(startAngleRad) * 100;
                const x2 = 144 + Math.cos(endAngleRad) * 100;
                const y2 = 144 + Math.sin(endAngleRad) * 100;
                
                const largeArcFlag = (nextAngle - angle) > 180 ? 1 : 0;
                
                const pathData = [
                  `M 144 144`,
                  `L ${x1} ${y1}`,
                  `A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');
                
                return (
                  <path
                    key={`segment-${number}-${index}`}
                    d={pathData}
                    fill={color === 'red' ? '#dc2626' : color === 'black' ? '#1f2937' : '#16a34a'}
                    stroke="white"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>
            
            {/* The numbers positioned precisely at the center of each segment */}
            {wheelNumbers.map((number, index) => {
              const segmentAngle = (360 / 37);
              // Calculate the center angle of the segment
              const centerAngle = (segmentAngle * index) + (segmentAngle / 2);
              const radians = ((centerAngle) * Math.PI) / 180;
              const radius = 120;
              const x = Math.cos(radians) * radius;
              const y = Math.sin(radians) * radius;
              
              return (
                <div
                  key={`${number}-${index}`}
                  className={`absolute flex items-center justify-center text-white font-bold text-xs ${
                    getColor(number) === 'red' ? 'bg-red-600' : 
                    getColor(number) === 'black' ? 'bg-gray-900' : 
                    'bg-green-600'
                  }`}
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    width: '24px',
                    height: '24px',
                    transform: `translate(-50%, -50%) rotate(-${rotation}deg)`, // Counter-rotate for numbers to stay upright
                    borderRadius: '50%',
                    border: '1px solid white'
                  }}
                >
                  {number}
                </div>
              );
            })}
            
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-yellow-300 shadow-inner flex items-center justify-center">
              <div className="text-xs font-bold text-black">SPIN</div>
            </div>
          </div>
          
          {/* Fixed pointer */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-l-transparent border-r-transparent border-b-yellow-400 z-10" />
        </div>
      </div>
      
      {/* Winning number display */}
      {winningNumber !== null && !spinning && (
        <div className="text-center bg-black/80 rounded-xl p-4 border-2 border-yellow-400 transform transition-all duration-500 scale-100 opacity-100">
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

// Chip Component
const ChipComponent = ({ value, selected, onClick }: {
  value: number;
  selected: boolean;
  onClick: (value: number) => void;
}) => (
  <button
    onClick={() => onClick(value)}
    className={`relative w-16 h-16 rounded-full border-4 font-bold text-sm shadow-lg transform transition-all duration-200 hover:scale-110 active:scale-95 ${
      selected 
        ? 'border-yellow-400 bg-gradient-to-br from-yellow-300 to-yellow-500 text-black scale-110' 
        : value === 5 ? 'border-red-400 bg-gradient-to-br from-red-500 to-red-700 text-white'
        : value === 25 ? 'border-green-400 bg-gradient-to-br from-green-500 to-green-700 text-white'
        : value === 100 ? 'border-gray-400 bg-gradient-to-br from-gray-600 to-gray-800 text-white'
        : value === 500 ? 'border-purple-400 bg-gradient-to-br from-purple-500 to-purple-700 text-white'
        : 'border-blue-400 bg-gradient-to-br from-blue-500 to-blue-700 text-white'
    }`}
  >
    ${value}
    {/* Chip pattern */}
    <div className="absolute inset-2 rounded-full border border-white/30" />
    <div className="absolute inset-3 rounded-full border border-white/20" />
  </button>
);

// Betting Spot Component (with improved hover effect)
const BettingSpot = ({ children, onClick, className = "" }: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <div
    onClick={onClick}
    className={`relative cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-98 ${className}`}
  >
    {children}
  </div>
);

// Main Roulette Game Component
const App = () => {
  const [coins, setCoins] = useState(5000);
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(25);
  const [spinning, setSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [message, setMessage] = useState('Place your bets!');
  const [showWin, setShowWin] = useState(false);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [gameHistory, setGameHistory] = useState<number[]>([]);

  // Function to simulate sound effects (stubbed out)
  const playSound = (type: string) => {
    console.log(`Playing ${type} sound`);
  };

  // Place a bet on the table
  const placeBet = (type: Bet['type'], numbers: number[], payout: number) => {
    if (coins < selectedChip || spinning) return;
    
    const betId = `${type}-${numbers.join('-')}-${Date.now()}`;
    const newBet: Bet = {
      type,
      numbers,
      amount: selectedChip,
      payout,
      id: betId
    };
    
    setBets((prev: any) => [...prev, newBet]);
    setCoins((prev: number) => prev - selectedChip);
    playSound('chip');
  };

  // Place a straight bet on a single number
  const placeStraightBet = (number: number) => {
    placeBet('straight', [number], 35);
  };

  // Place an outside bet (e.g., Red/Black, Odd/Even)
  const placeOutsideBet = (type: Bet['type'], numbers: number[], payout: number) => {
    placeBet(type, numbers, payout);
  };

  // Spin the wheel and determine the winning number
  const spinWheel = () => {
    if (bets.length === 0 || spinning) return;
    
    setSpinning(true);
    setMessage('Spinning...');
    setWinningNumber(null);
    setShowWin(false);
    playSound('spin');
    
    // Generate winning number (0-36)
    const result = Math.floor(Math.random() * 37);
    setWinningNumber(result);
    setGameHistory((prev: string | any[]) => [result, ...prev.slice(0, 9)]);
  };

  // Handle the end of a spin and calculate winnings
  const onSpinComplete = () => {
    if (winningNumber === null) return;
    
    let totalWinAmount = 0;
    
    bets.forEach((bet: { numbers: string | any[]; amount: number; payout: number; }) => {
      if (bet.numbers.includes(String(winningNumber))) {
        const winAmount = bet.amount * (bet.payout + 1);
        totalWinAmount += winAmount;
      }
    });
    
    if (totalWinAmount > 0) {
      setCoins((prev: number) => prev + totalWinAmount);
      setTotalWinnings(totalWinAmount);
      setShowWin(true);
      setMessage(`🎉 Number ${winningNumber} (${getColor(winningNumber).toUpperCase()}) wins $${totalWinAmount}! 🎉`);
      playSound('win');
      setTimeout(() => setShowWin(false), 3000);
    } else {
      setMessage(`Number ${winningNumber} (${getColor(winningNumber).toUpperCase()}). Better luck next time!`);
    }
    
    setSpinning(false);
    
    // Clear bets after 3 seconds
    setTimeout(() => {
      setBets([]);
      setMessage('Place your bets!');
    }, 3000);
  };

  // Clear all bets and return chips to balance
  const clearBets = () => {
    const totalBetAmount = bets.reduce((sum: any, bet: { amount: any; }) => sum + bet.amount, 0);
    setCoins((prev: any) => prev + totalBetAmount);
    setBets([]);
  };

  // Correct roulette number layout (as it appears on real table)
  const rouletteLayout = [
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 relative overflow-hidden font-sans text-gray-100">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #fff 1px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Win Animation Modal */}
      {showWin && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in-scale">
          <div className="bg-black/90 rounded-2xl p-8 border-4 border-yellow-400 shadow-[0_0_40px_rgba(255,255,0,0.8)] text-center transform scale-100 animate-pulse-once">
            <div className="text-6xl font-bold text-yellow-400 mb-4 animate-bounce">
              <span role="img" aria-label="jackpot">🎰</span> BIG WIN! <span role="img" aria-label="jackpot">🎰</span>
            </div>
            <div className="text-4xl text-green-400 font-bold">
              +${totalWinnings}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 relative z-10 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 mb-2">
            EUROPEAN ROULETTE
          </h1>
          <div className="text-xl text-yellow-200">Single Zero • House Edge 2.7%</div>
        </div>

        {/* Game Stats */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-6 bg-black/50 rounded-xl p-4 border border-yellow-500/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">${coins.toLocaleString()}</div>
              <div className="text-sm text-gray-300">BALANCE</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">${bets.reduce((sum: any, bet: { amount: any; }) => sum + bet.amount, 0)}</div>
              <div className="text-sm text-gray-300">TOTAL BETS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{bets.length}</div>
              <div className="text-sm text-gray-300">ACTIVE BETS</div>
            </div>
          </div>
        </div>

        {/* Main Game Layout */}
        <div className="flex flex-col xl:flex-row gap-6 max-w-7xl mx-auto">
            {/* Betting Table */}
            <div className="flex-1 bg-gradient-to-br from-green-800 to-green-900 rounded-2xl border-4 border-yellow-600 shadow-[0_0_20px_rgba(0,0,0,0.5)] p-6">
                <div className="flex items-start">
                    {/* Zero section */}
                    <BettingSpot onClick={() => placeStraightBet(0)} className="w-16 h-48 bg-green-600 border-2 border-white flex items-center justify-center text-white font-bold text-2xl rounded shadow-inner hover:bg-green-500 transition-colors">
                        0
                    </BettingSpot>

                    {/* Main number grid and outside bets */}
                    <div className="flex-1 ml-4">
                        {/* Main number grid */}
                        <div className="mb-4 grid grid-cols-12 gap-1">
                            {rouletteLayout.map((row, rowIndex) => (
                                <React.Fragment key={rowIndex}>
                                    {row.map(number => (
                                        <BettingSpot
                                            key={number}
                                            onClick={() => placeStraightBet(number)}
                                            className="col-span-1"
                                        >
                                            <div className={`w-full h-12 rounded border border-white flex items-center justify-center text-white font-bold text-sm transition-all hover:scale-105 shadow-md ${
                                                getColor(number) === 'red' ? 'bg-red-600 hover:bg-red-500' : 'bg-black hover:bg-gray-800'
                                            }`}>
                                                {number}
                                            </div>
                                        </BettingSpot>
                                    ))}
                                    {/* Column bets */}
                                    <BettingSpot
                                        onClick={() => placeOutsideBet('column', rouletteLayout[rowIndex], 2)}
                                        className="col-span-1"
                                    >
                                        <div className="w-full h-12 bg-yellow-600 border-2 border-white flex items-center justify-center text-black font-bold text-xs rounded shadow-md hover:bg-yellow-500 transition-colors">
                                            2:1
                                        </div>
                                    </BettingSpot>
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Dozen bets */}
                        <div className="flex gap-1 mb-4">
                            <BettingSpot
                                onClick={() => placeOutsideBet('dozen', Array.from({length: 12}, (_, i) => i + 1), 2)}
                                className="flex-1"
                            >
                                <div className="h-12 bg-yellow-600 border-2 border-white flex items-center justify-center text-black font-bold text-xs rounded shadow-md hover:bg-yellow-500 transition-colors">
                                    1st 12
                                </div>
                            </BettingSpot>
                            <BettingSpot
                                onClick={() => placeOutsideBet('dozen', Array.from({length: 12}, (_, i) => i + 13), 2)}
                                className="flex-1"
                            >
                                <div className="h-12 bg-yellow-600 border-2 border-white flex items-center justify-center text-black font-bold text-xs rounded shadow-md hover:bg-yellow-500 transition-colors">
                                    2nd 12
                                </div>
                            </BettingSpot>
                            <BettingSpot
                                onClick={() => placeOutsideBet('dozen', Array.from({length: 12}, (_, i) => i + 25), 2)}
                                className="flex-1"
                            >
                                <div className="h-12 bg-yellow-600 border-2 border-white flex items-center justify-center text-black font-bold text-xs rounded shadow-md hover:bg-yellow-500 transition-colors">
                                    3rd 12
                                </div>
                            </BettingSpot>
                        </div>

                        {/* Even money bets */}
                        <div className="flex gap-1">
                            <BettingSpot onClick={() => placeOutsideBet('low', Array.from({length: 18}, (_, i) => i + 1), 1)} className="flex-1">
                                <div className="h-12 bg-yellow-600 border-2 border-white flex items-center justify-center text-black font-bold text-xs rounded shadow-md hover:bg-yellow-500 transition-colors">
                                    1-18
                                </div>
                            </BettingSpot>
                            <BettingSpot onClick={() => placeOutsideBet('even', Array.from({length: 18}, (_, i) => (i + 1) * 2), 1)} className="flex-1">
                                <div className="h-12 bg-yellow-600 border-2 border-white flex items-center justify-center text-black font-bold text-xs rounded shadow-md hover:bg-yellow-500 transition-colors">
                                    EVEN
                                </div>
                            </BettingSpot>
                            <BettingSpot onClick={() => placeOutsideBet('red', redNumbers, 1)} className="flex-1">
                                <div className="h-12 bg-red-600 border-2 border-white flex items-center justify-center text-white font-bold text-xs rounded shadow-md hover:bg-red-500 transition-colors">
                                    RED
                                </div>
                            </BettingSpot>
                            <BettingSpot onClick={() => placeOutsideBet('black', Array.from({length: 36}, (_, i) => i + 1).filter(n => !redNumbers.includes(n)), 1)} className="flex-1">
                                <div className="h-12 bg-black border-2 border-white flex items-center justify-center text-white font-bold text-xs rounded shadow-md hover:bg-gray-800 transition-colors">
                                    BLACK
                                </div>
                            </BettingSpot>
                            <BettingSpot onClick={() => placeOutsideBet('odd', Array.from({length: 18}, (_, i) => (i * 2) + 1), 1)} className="flex-1">
                                <div className="h-12 bg-yellow-600 border-2 border-white flex items-center justify-center text-black font-bold text-xs rounded shadow-md hover:bg-yellow-500 transition-colors">
                                    ODD
                                </div>
                            </BettingSpot>
                            <BettingSpot onClick={() => placeOutsideBet('high', Array.from({length: 18}, (_, i) => i + 19), 1)} className="flex-1">
                                <div className="h-12 bg-yellow-600 border-2 border-white flex items-center justify-center text-black font-bold text-xs rounded shadow-md hover:bg-yellow-500 transition-colors">
                                    19-36
                                </div>
                            </BettingSpot>
                        </div>
                    </div>
                </div>
            </div>

            {/* Control Panel and Wheel */}
            <div className="w-full xl:w-80 flex flex-col items-center">
              {/* Roulette Wheel */}
              <RouletteWheel 
                spinning={spinning} 
                winningNumber={winningNumber} 
                onSpinComplete={onSpinComplete}
              />
              
              {/* Game Message */}
              <div className="text-center mb-6 w-full">
                <div className={`text-2xl font-bold min-h-12 transition-all duration-500 ${
                  message.includes('wins') ? 'text-green-400 animate-pulse' : 
                  message.includes('Better luck') ? 'text-red-400' :
                  'text-yellow-300'
                }`}>
                  {message}
                </div>
              </div>

              {/* Recent Numbers */}
              {gameHistory.length > 0 && (
                <div className="w-full mb-6">
                  <div className="bg-black/50 rounded-xl p-4 border border-yellow-500/50 backdrop-blur-sm shadow-inner">
                    <div className="text-white font-semibold mb-2 text-center">RECENT NUMBERS</div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {gameHistory.map((num: any, index: number) => (
                        <div
                          key={`${num}-${index}`}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 transition-all duration-300 shadow-md ${
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
                
              {/* Chip and Control Buttons Panel */}
              <div className="bg-black/50 rounded-xl p-6 border border-yellow-500/50 backdrop-blur-sm shadow-inner w-full">
                <div className="text-white font-bold mb-6 text-center text-xl">CHIPS</div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[5, 25, 100, 500].map(value => (
                    <ChipComponent
                      key={value}
                      value={value}
                      selected={selectedChip === value}
                      onClick={setSelectedChip}
                    />
                  ))}
                </div>

                <div className="space-y-4 mb-6">
                  <button
                    onClick={spinWheel}
                    disabled={bets.length === 0 || spinning}
                    className={`w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold rounded-xl border-2 border-green-400 shadow-lg transition-all duration-200 text-lg ${
                      bets.length > 0 && !spinning 
                        ? 'hover:from-green-500 hover:to-green-700 hover:scale-105' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {spinning ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin text-2xl">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="h-6 w-6"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c-35.3 0-64 28.7-64 64s28.7 64 64 64s64-28.7 64-64s-28.7-64-64-64zm96 208a16 16 0 1 1 0-32 16 16 0 1 1 0 32zM160 352a16 16 0 1 1 0-32 16 16 0 1 1 0 32zm160-32a16 16 0 1 1 0-32 16 16 0 1 1 0 32zm0-64a16 16 0 1 1 0-32 16 16 0 1 1 0 32zM160 256a16 16 0 1 1 0-32 16 16 0 1 1 0 32zm0-64a16 16 0 1 1 0-32 16 16 0 1 1 0 32zM288 320a16 16 0 1 1 0-32 16 16 0 1 1 0 32zM224 224a16 16 0 1 1 0-32 16 16 0 1 1 0 32zM192 192a16 16 0 1 1 0-32 16 16 0 1 1 0 32zM320 160a16 16 0 1 1 0-32 16 16 0 1 1 0 32zm0 64a16 16 0 1 1 0-32 16 16 0 1 1 0 32zM256 160a16 16 0 1 1 0-32 16 16 0 1 1 0 32z"/></svg>
                        </span>
                        SPINNING...
                      </span>
                    ) : (
                      'SPIN WHEEL'
                    )}
                  </button>

                  <button
                    onClick={clearBets}
                    disabled={bets.length === 0 || spinning}
                    className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-xl border-2 border-red-400 hover:from-red-500 hover:to-red-700 disabled:opacity-50 transition-all duration-200 shadow-lg"
                  >
                    CLEAR ALL BETS
                  </button>
                </div>

                {/* Bet summary */}
                {bets.length > 0 && (
                  <div className="pt-4 border-t border-gray-600">
                    <div className="text-white font-semibold mb-3 text-center">ACTIVE BETS</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {bets.map((bet: { id: Key | null | undefined; type: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | Iterable<ReactNode> | null | undefined; amount: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | Iterable<ReactNode> | null | undefined; }) => (
                        <div key={bet.id} className="text-sm text-gray-300 flex justify-between items-center bg-white/5 rounded p-2 shadow-inner">
                          <span className="capitalize font-medium">{bet.type}</span>
                          <span className="text-yellow-400 font-bold">${bet.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Quick bet buttons */}
                <div className="mt-6 pt-4 border-t border-gray-600">
                  <div className="text-white font-semibold mb-3 text-center text-sm">QUICK BETS</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => placeOutsideBet('red', redNumbers, 1)}
                      disabled={coins < selectedChip || spinning}
                      className="px-3 py-2 bg-red-600 text-white rounded text-sm font-bold hover:bg-red-500 disabled:opacity-50 transition-colors shadow-md"
                    >
                      RED
                    </button>
                    <button
                      onClick={() => placeOutsideBet('black', Array.from({length: 36}, (_, i) => i + 1).filter(n => !redNumbers.includes(n)), 1)}
                      disabled={coins < selectedChip || spinning}
                      className="px-3 py-2 bg-black text-white rounded text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-md"
                    >
                      BLACK
                    </button>
                    <button
                      onClick={() => placeOutsideBet('odd', Array.from({length: 18}, (_, i) => (i * 2) + 1), 1)}
                      disabled={coins < selectedChip || spinning}
                      className="px-3 py-2 bg-yellow-600 text-black rounded text-sm font-bold hover:bg-yellow-500 disabled:opacity-50 transition-colors shadow-md"
                    >
                      ODD
                    </button>
                    <button
                      onClick={() => placeOutsideBet('even', Array.from({length: 18}, (_, i) => (i + 1) * 2), 1)}
                      disabled={coins < selectedChip || spinning}
                      className="px-3 py-2 bg-yellow-600 text-black rounded text-sm font-bold hover:bg-yellow-500 disabled:opacity-50 transition-colors shadow-md"
                    >
                      EVEN
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Payouts table */}
        <div className="max-w-4xl mx-auto mt-8 bg-black/40 rounded-xl p-6 border border-yellow-500/30 shadow-lg">
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
      
      {/* Tailwind CSS keyframes for custom animations */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.5s ease-out forwards;
        }
        @keyframes pulseOnce {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-pulse-once {
          animation: pulseOnce 1s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default App;
