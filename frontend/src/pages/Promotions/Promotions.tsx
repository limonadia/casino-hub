'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import { userService } from "../../services/userService";
import { useAuth } from "../../services/authContext";
import type { User } from "../../models/user"; 

function Promotions() {
  const { user, setBalance, setUser } = useAuth();
  
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', isError: false });
  const [ballRotation, setBallRotation] = useState(0);
  const [ballPosition, setBallPosition] = useState({ x: 87, y: 12 });
  
  const [canClaimCash, setCanClaimCash] = useState(false);
  const [canSpinWheel, setCanSpinWheel] = useState(false);
  const [cashCountdownText, setCashCountdownText] = useState('Loading...');
  const [wheelCountdownText, setWheelCountdownText] = useState('Loading...');
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);

  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const GO_ZERO_DATE = "0001-01-01T00:00:00Z";
  
  const SECTOR_ANGLE = 360 / 8;
  
  // Prize mapping - must match backend order exactly
  const PRIZES = [
    { value: 50, text: "50", color: "#DB2777" },      // Sector 0
    { value: 100, text: "100", color: "#111827" },    // Sector 1
    { value: 200, text: "200", color: "#10b981" },    // Sector 2
    { value: 75, text: "75", color: "#DB2777" },      // Sector 3
    { value: 150, text: "150", color: "#111827" },    // Sector 4
    { value: 125, text: "125", color: "#10b981" },    // Sector 5
    { value: 300, text: "300", color: "#DB2777" },    // Sector 6
    { value: 100, text: "100", color: "#111827" },    // Sector 7
  ];
  
  const formatTimeRemaining = (ms: number): string => {
    if (ms <= 0) return 'Ready to use!';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const checkCooldowns = useCallback(() => {
    if (!user) return;

    const lastCashTimeStr = user.lastCashClaim;
    let lastCashTime = 0;

    if (lastCashTimeStr && lastCashTimeStr !== GO_ZERO_DATE) {
        lastCashTime = new Date(lastCashTimeStr).getTime();
    }
    
    const cashTimeRemaining = lastCashTime ? (lastCashTime + TWENTY_FOUR_HOURS) - Date.now() : 0;

    if (cashTimeRemaining <= 0) {
        setCanClaimCash(true);
        setCashCountdownText('Ready to claim!');
    } else {
        setCanClaimCash(false);
        setCashCountdownText(`Next claim in: ${formatTimeRemaining(cashTimeRemaining)}`);
    }

    const lastWheelTimeStr = user.lastWheelSpin;
    let lastWheelTime = 0;
    
    if (lastWheelTimeStr && lastWheelTimeStr !== GO_ZERO_DATE) {
        lastWheelTime = new Date(lastWheelTimeStr).getTime();
    }
    
    const wheelTimeRemaining = lastWheelTime ? (lastWheelTime + TWENTY_FOUR_HOURS) - Date.now() : 0;
    
    if (wheelTimeRemaining <= 0) {
        setCanSpinWheel(true);
        setWheelCountdownText('Ready to spin!');
    } else {
        setCanSpinWheel(false);
        setWheelCountdownText(`Next spin in: ${formatTimeRemaining(wheelTimeRemaining)}`);
    }

  }, [user, TWENTY_FOUR_HOURS]);

  useEffect(() => {
    if (!user) {
        setCashCountdownText('Loading user data...');
        setWheelCountdownText('Loading user data...');
        return;
    }

    checkCooldowns(); 
    const interval = setInterval(checkCooldowns, 1000);
    return () => clearInterval(interval);
  }, [user, checkCooldowns]);

  const showNotification = (message: string, isError = false) => {
    setNotification({ show: true, message, isError });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const claimDailyCash = async () => {
    if (!user || !canClaimCash) return;
    try {
      const data : any = await userService.claimCash();
      setBalance(data.balance);
      
      setUser((prevUser: User | null) => ({
        ...prevUser!, 
        lastCashClaim: data.lastCashClaim, 
      }));
      
      checkCooldowns();
      showNotification("100 chips added to your balance!");
    } catch (err: any) {
      showNotification(err.message || "Already claimed today", true);
    }
  }

  const animateBallToWinning = (winningIndex: number, finalWheelRotation: number) => {
    setTimeout(() => {
      const ballSpins = 8 + Math.floor(Math.random() * 3);
      const ballRotationAmount = 360 * ballSpins;
      
      setBallRotation(prev => prev + ballRotationAmount);
      
      setTimeout(() => {
        // Calculate the final position based on winning sector
        const winningAngle = (winningIndex * SECTOR_ANGLE) - 90;
        const finalAngle = (winningAngle + finalWheelRotation) * (Math.PI / 180);
        
        const radius = 37;
        const centerX = 50;
        const centerY = 50;
        
        const finalBallX = centerX + Math.cos(finalAngle) * radius;
        const finalBallY = centerY + Math.sin(finalAngle) * radius;
        
        setBallPosition({ x: finalBallX, y: finalBallY });
      }, 3200);
    }, 100);
  };

  const animateToWinning = (winningIndex: number) => {
    const fullRotations = 5 + Math.floor(Math.random() * 3);
    const finalRotation = 360 * fullRotations;

    setIsSpinning(true);
    setRotation(prev => prev + finalRotation);
    animateBallToWinning(winningIndex, rotation + finalRotation);

    const duration = 5000;
    setTimeout(() => {
      setIsSpinning(false);
    }, duration + 50);
  };

  const spinWheel = async () => {
    if (!user || isSpinning || !canSpinWheel) return;
    
    try {
      setBallPosition({ x: 87, y: 12 });
      
      const data: any = await userService.spinWheel();
      
      setUser((prevUser: User | null) => ({
        ...prevUser!, 
        lastWheelSpin: data.lastWheelSpin,
      }));

      checkCooldowns();

      if (data.balance) {
        setBalance(data.balance);
      }

      // Parse the reward to determine winning sector
      let winningIndex = 0;
      const rewardText = data.reward || "";
      
      // Find matching prize index
      for (let i = 0; i < PRIZES.length; i++) {
        if (PRIZES[i].text === rewardText) {
          winningIndex = i;
          break;
        }
      }

      animateToWinning(winningIndex);

      setTimeout(() => {
        showNotification(data.message);
      }, 5000);
    } catch (err: any) {
      showNotification(err.message || "Already spun today", true);
      setIsSpinning(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 p-5">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-10 drop-shadow-lg">
          Daily Promotions
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Daily Cash Bonus */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl hover:transform hover:-translate-y-2 transition-all duration-300">
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-4">Daily Cash Bonus</h2>
            <p className="text-white/90 text-center mb-6">
              Collect your free daily cash bonus! Come back every 24 hours for more rewards.
            </p>
            <button
              onClick={claimDailyCash}
              disabled={!canClaimCash}
              className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl ${
                canClaimCash
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 hover:scale-[1.02] active:scale-100 text-white'
                  : 'bg-gray-700/80 text-gray-400 cursor-not-allowed opacity-80 shadow-inner'
              }`}
            >
              {canClaimCash ? (
                <span className="flex items-center justify-center gap-1">
                  Claim <span className="material-symbols-outlined">poker_chip</span>100
                </span>
              ) : 'Already Claimed'}
            </button>
            <div className="text-center mt-4 text-yellow-400 text-sm font-mono">
              {cashCountdownText}
            </div>
          </div>

          {/* Spin the Wheel */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl hover:transform hover:-translate-y-2 transition-all duration-300">
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-4">Lucky Wheel</h2>
            <p className="text-white/90 text-center mb-6">
              Spin the wheel once every 24 hours for amazing prizes!
            </p>
            
            <div className="w-80 h-80 rounded-full shadow-2xl overflow-hidden relative mb-6 mx-auto">
              <div 
                ref={wheelRef} 
                style={{
                  transform: `rotate(${rotation}deg)`, 
                  transition: isSpinning ? 'transform 5s cubic-bezier(.17,.67,.2,1)' : 'transform 0.5s ease-out'
                }}
                className="w-full h-full rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"
              >
                <svg viewBox="0 0 500 500" className="w-full h-full">
                  <g transform="translate(250,250)">
                    {PRIZES.map((prize, i) => {
                      const startAngle = (i * SECTOR_ANGLE - 90) * (Math.PI / 180);
                      const endAngle = ((i + 1) * SECTOR_ANGLE - 90) * (Math.PI / 180);
                      const x1 = Math.cos(startAngle) * 200;
                      const y1 = Math.sin(startAngle) * 200;
                      const x2 = Math.cos(endAngle) * 200;
                      const y2 = Math.sin(endAngle) * 200;
                      const path = `M 0 0 L ${x1} ${y1} A 200 200 0 0 1 ${x2} ${y2} Z`;
                      
                      const textAngle = (i + 0.5) * SECTOR_ANGLE - 90;
                      const textX = Math.cos((textAngle) * (Math.PI / 180)) * 120;
                      const textY = Math.sin((textAngle) * (Math.PI / 180)) * 120;
                      const textRotation = textAngle + 90;
                      
                      return (
                        <g key={i}>
                          <path d={path} fill={prize.color} stroke="#ffffff22" strokeWidth="1"/>
                          <text 
                            x={textX} 
                            y={textY} 
                            fill="white" 
                            fontSize="20" 
                            fontWeight="700" 
                            textAnchor="middle" 
                            transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                          >
                            {prize.text}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </svg>
              </div>
              
              {/* White ball */}
              <div 
                ref={ballRef}
                style={{
                  position: 'absolute',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  zIndex: 10,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  top: `${ballPosition.y}%`,
                  left: `${ballPosition.x}%`,
                  transform: ballPosition.x === 87 ? `rotate(${ballRotation}deg)` : 'none',
                  transformOrigin: ballPosition.x === 87 ? '-112px center' : '0 0',
                  transition: ballPosition.x === 87 ? 'transform 5s cubic-bezier(.17,.67,.2,1)' : 'all 0.8s ease-out',
                }}
              />
            </div>
            
            <button
              onClick={spinWheel}
              disabled={!canSpinWheel || isSpinning}
              className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl ${
                canSpinWheel && !isSpinning
                  ? 'bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 hover:scale-[1.02] active:scale-100 text-white'
                  : 'bg-gray-700/80 text-gray-400 cursor-not-allowed opacity-80 shadow-inner'
              }`}
            >
              {isSpinning ? 'Spinning...' : canSpinWheel ? 'Spin the Wheel!' : 'Already Spun Today'}
            </button>
            <div className="text-center mt-4 text-yellow-400 text-sm font-mono">
              {wheelCountdownText}
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-5 right-5 p-4 rounded-lg text-white font-bold shadow-xl transition-all duration-300 z-50 ${
          notification.isError ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default Promotions;