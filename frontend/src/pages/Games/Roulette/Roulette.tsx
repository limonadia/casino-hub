import { useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../services/authContext';
import { BetEnum, rouletteService, type BetType } from '../../../services/rouletteService';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const POCKETS = [
  { n: 0, color: 'green' },
  { n: 32, color: 'red' },
  { n: 15, color: 'black' },
  { n: 19, color: 'red' },
  { n: 4, color: 'black' },
  { n: 21, color: 'red' },
  { n: 2, color: 'black' },
  { n: 25, color: 'red' },
  { n: 17, color: 'black' },
  { n: 34, color: 'red' },
  { n: 6, color: 'black' },
  { n: 27, color: 'red' },
  { n: 13, color: 'black' },
  { n: 36, color: 'red' },
  { n: 11, color: 'black' },
  { n: 30, color: 'red' },
  { n: 8, color: 'black' },
  { n: 23, color: 'red' },
  { n: 10, color: 'black' },
  { n: 5, color: 'red' },
  { n: 24, color: 'black' },
  { n: 16, color: 'red' },
  { n: 33, color: 'black' },
  { n: 1, color: 'red' },
  { n: 20, color: 'black' },
  { n: 14, color: 'red' },
  { n: 31, color: 'black' },
  { n: 9, color: 'red' },
  { n: 22, color: 'black' },
  { n: 18, color: 'red' },
  { n: 29, color: 'black' },
  { n: 7, color: 'red' },
  { n: 28, color: 'black' },
  { n: 12, color: 'red' },
  { n: 35, color: 'black' },
  { n: 3, color: 'red' },
  { n: 26, color: 'black' }
];

const SECTOR_ANGLE = 360 / POCKETS.length;

export default function RouletteWheel() {
  const { balance, setBalance } = useAuth();
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0); 
  const [selectedBet, setSelectedBet] = useState<BetType | null>(null);
  const [stake, setStake] = useState(100);
  const [message, setMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  const sectors = useMemo(() => POCKETS, []);

  function payoutMultiplier(bet: BetType) {
    switch (bet.kind) {
      case 'number':
        return 35; 
      case 'color':
      case 'parity':
        return 1;
      case 'dozen':
      case 'column':
        return 2;
      default:
        return 0;
    }
  }

  function evaluateBet(bet: BetType | null, winningNumber: number) {
    if (!bet) return { won: false, payout: 0 };
    const pocket = POCKETS.find(p => p.n === winningNumber)!;
    if (!pocket) return { won: false, payout: 0 };

    let won = false;
    if (bet.kind === 'number') won = bet.value === winningNumber;
    if (bet.kind === 'color') won = pocket.color === bet.value;
    if (bet.kind === 'parity') {
      if (winningNumber === 0) won = false; else won = (winningNumber % 2 === 0) === (bet.value === 'even');
    }
    if (bet.kind === 'dozen') {
      const d = Math.ceil(winningNumber / 12);
      won = d === bet.value;
    }
    if (bet.kind === 'column') {
      if (winningNumber === 0) won = false; else {
        const col = ((winningNumber - 1) % 3) + 1;
        won = col === bet.value;
      }
    }

    if (!won) return { won: false, payout: 0 };
    const multiplier = payoutMultiplier(bet);
    return { won: true, payout: stake * multiplier };
  }

  async function serverSpin(bet: BetType | null, stake: number) {
    if (!bet) return null;
  
    let type: BetEnum;
    let value: number | string;
  
    if (bet.kind === 'number') {
      type = BetEnum.Number;
      value = bet.value;
    } else if (bet.kind === 'color') {
      type = BetEnum.Color;
      value = bet.value;
    } else if (bet.kind === 'parity') {
      type = BetEnum.OddEven;
      value = bet.value;
    } else if (bet.kind === 'dozen') {
      type = BetEnum.Dozen;
      value = bet.value;
    } else if (bet.kind === 'column') {
      type = BetEnum.Column;
      value = bet.value;
    } else {
      return null;
    }
  
    return await rouletteService.spin(bet, stake);
  }

  const [ballRotation, setBallRotation] = useState(0);
  const [ballPosition, setBallPosition] = useState({ x: 87, y: 47 });
  const ballRef = useRef<HTMLDivElement | null>(null);

function animateBallToWinning(winningIndex: number) {
  setTimeout(() => {
    const ballSpins = 8 + Math.floor(Math.random() * 3);
    const ballRotationAmount = 360 * ballSpins;
    
    setBallRotation(prev => prev + ballRotationAmount);
    
    setTimeout(() => {
      const winningAngle = (winningIndex * SECTOR_ANGLE) - 90;
      const currentWheelRotation = rotation + (360 * (5 + Math.floor(Math.random() * 3)));
      const finalAngle = (winningAngle + currentWheelRotation) * (Math.PI / 180);
      
      const radius = 37;
      const centerX = 50;
      const centerY = 50;
      
      const finalBallX = centerX + Math.cos(finalAngle) * radius;
      const finalBallY = centerY + Math.sin(finalAngle) * radius;
      
      setBallPosition({ x: finalBallX, y: finalBallY });
    }, 3200);
  }, 100);
}

function animateToWinning(winningIndex: number) {
  const fullRotations = 5 + Math.floor(Math.random() * 3);
  const finalRotation = 360 * fullRotations;

  setIsSpinning(true);
  setRotation(prev => prev + finalRotation);
  animateBallToWinning(winningIndex);

  const duration = 5000;
  setTimeout(() => {
    setIsSpinning(false);
  }, duration + 50);
}

  const spin = async () => {
    if (isSpinning) return;
    if (!selectedBet) {
      setMessage(t('Select a bet first'));
      return;
    }
    if (stake <= 0) {
      setMessage(t('Invalid stake'));
      return;
    }
    if (stake > balance) {
      setMessage(t('Insufficient balance'));
      return;
    }

    setMessage(null);
    setBallPosition({ x: 87, y: 47 });

    const serverResult: any = await serverSpin(selectedBet, stake);
    let winningNumber: number;
    let serverPayout = 0;
    if (serverResult && typeof serverResult.winningNumber === 'number') {
      winningNumber = serverResult.winningNumber;
      serverPayout = serverResult.payout || 0;
    } else {
      const index = Math.floor(Math.random() * POCKETS.length);
      winningNumber = POCKETS[index].n;
    }
    
    const winningIndex = POCKETS.findIndex(p => p.n === winningNumber);
    if (winningIndex < 0) {
      setMessage(t('Invalid winning number from server'));
      return;
    }

    animateToWinning(winningIndex);

    const animationWait = 5100;
    setTimeout(() => {
      let won = false;
      let payout = 0;
      if (serverResult && typeof serverResult.payout === 'number') {
        payout = serverResult.payout;
        won = payout > 0;
      } else {
        const res = evaluateBet(selectedBet, winningNumber);
        won = res.won;
        payout = res.payout;
      }

    setMessage(won ? t("You won {{payout}}! Number {{winningNumber}}", {payout, winningNumber}) : t("You lost. Number {{winningNumber}}", {winningNumber}));
    setBalance(serverResult.newBalance);
    }, animationWait + 20);
  };

  const getButtonStyle = (betType: any, betValue: any) => {
    const isSelected = selectedBet?.kind === betType && selectedBet?.value === betValue;
    return {
      backgroundColor: isSelected ? '#ec4899' : '#374151',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      border: isSelected ? '2px solid #DB2777' : '2px solid transparent',
      transition: 'all 0.2s ease'
    };
  };

  return (
    <div className=" mx-auto p-6 min-h-screen bg-gradient-to-br from-blue-900 via-pink-500 to-purple-800 relative overflow-hidden">
      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <motion.h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-900 mb-2"
          animate={{ 
            textShadow: [
              "0 0 20px pink",
              "0 0 40px purple, 0 0 60px violet",
              "0 0 20px violet"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            ROULETTE
        </motion.h1>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        
        <div className="relative flex flex-col items-center">
          {/* Balance */}
          <div className="bg-slate-800 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center mb-2">
              <div className="font-mono text-xl text-casinoPink flex items-center"><span className="material-symbols-outlined">poker_chip</span>{balance.toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" value={stake} onChange={e => setStake(Number(e.target.value))} className="w-32 px-3 py-2 rounded bg-gray-700" />
              <button onClick={() => setStake(Math.min(balance, stake + 100))} className="px-3 py-2 bg-green-600 rounded">+100</button>
              <button onClick={() => setStake(Math.max(1, stake - 100))} className="px-3 py-2 bg-red-600 rounded">-100</button>
            </div>
          </div>
          {/* Wheel */}
          <div className="w-80 h-80 rounded-full shadow-2xl overflow-hidden relative mb-2">
            <div ref={wheelRef} style={{transform: `rotate(${rotation}deg)`, transition: isSpinning ? 'transform 5s cubic-bezier(.17,.67,.2,1)' : 'transform 0.5s ease-out'}}
              className="w-full h-full rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <svg viewBox="0 0 500 500" className="w-full h-full">
                <g transform="translate(250,250)">
                  {sectors.map((s, i) => {
                    const startAngle = (i * SECTOR_ANGLE - 90) * (Math.PI / 180);
                    const endAngle = ((i + 1) * SECTOR_ANGLE - 90) * (Math.PI / 180);
                    const x1 = Math.cos(startAngle) * 200;
                    const y1 = Math.sin(startAngle) * 200;
                    const x2 = Math.cos(endAngle) * 200;
                    const y2 = Math.sin(endAngle) * 200;
                    const large = 0;
                    const path = `M 0 0 L ${x1} ${y1} A 200 200 0 ${large} 1 ${x2} ${y2} Z`;
                    const bg = s.color === 'red' ? '#DB2777' : s.color === 'black' ? '#111827' : '#10b981';
                    const textAngle = (i + 0.5) * SECTOR_ANGLE - 90;
                    const textX = Math.cos((textAngle) * (Math.PI / 180)) * 120;
                    const textY = Math.sin((textAngle) * (Math.PI / 180)) * 120;
                    const textRotation = textAngle + 90;
                    return (
                      <g key={s.n}>
                        <path d={path} fill={bg} stroke="#ffffff22" strokeWidth={1} />
                        <text x={textX} y={textY} fill={s.color === 'black' ? '#fff' : '#fff'} fontSize={18} fontWeight={700} transform={`rotate(${textRotation}, ${textX}, ${textY})`} textAnchor="middle">
                          {s.n}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
            {/* White ball */}
            <motion.div ref={ballRef} style={{
                position: 'absolute',
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: 'white',
                zIndex: 10,
                transformOrigin: ballPosition.x === 87 ? '-112px center' : '0 0', 
              }}
              animate={{ 
                top: `${ballPosition.y}%`,
                left: `${ballPosition.x}%`,
                rotate: ballPosition.x === 87 ? ballRotation : 0,
              }}
              transition={{ 
                top: { duration: 0.8, ease: "easeOut" },
                left: { duration: 0.8, ease: "easeOut" },
                rotate: { duration: 5, ease: [0.17,0.67,0.2,1] }
              }}
            />
          </div>
          {/* Spin Button */}
          <div className="flex items-center flex-col justify-center">
            <button onClick={spin} disabled={isSpinning} className={`px-6 py-3 rounded-lg font-bold ${isSpinning ? 'bg-gray-600' : 'bg-yellow-500 hover:bg-yellow-400'}`}>
              {isSpinning ? 'Spinning...' : 'Spin'}
            </button>
            <div className={`text-sm pt-3 font-bold ${message && (message.includes('wins') || message.includes('won')) ? 'text-green-400 animate-pulse' : (message && message.includes('You lost.')) ? 'text-black' : 'text-gold-500'}`}>
              {message}
            </div>
          </div>
        </div>
          {/* Betting Actions */}
        <div className="flex-1">
          <div className="bg-slate-800 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setSelectedBet({ kind: 'color', value: 'red' })} style={getButtonStyle('color', 'red')}>
                {t("Red")}
              </button>
              <button onClick={() => setSelectedBet({ kind: 'color', value: 'black' })} style={getButtonStyle('color', 'black')}>
                {t("Black")}
              </button>
              <button onClick={() => setSelectedBet({ kind: 'parity', value: 'even' })} style={getButtonStyle('parity', 'even')}>
                {t("Even")}
              </button>
              <button onClick={() => setSelectedBet({ kind: 'parity', value: 'odd' })} style={getButtonStyle('parity', 'odd')}>
                {t("Odd")}
              </button>
              <button onClick={() => setSelectedBet({ kind: 'dozen', value: 1 })} style={getButtonStyle('dozen', 1)}>
                1-12
              </button>
              <button onClick={() => setSelectedBet({ kind: 'dozen', value: 2 })} style={getButtonStyle('dozen', 2)}>
                13-24
              </button>
              <button onClick={() => setSelectedBet({ kind: 'dozen', value: 3 })} style={getButtonStyle('dozen', 3)}>
                25-36
              </button>
            </div>

            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 37 }, (_, i) => i).map(n => (
                  <button key={n} onClick={() => setSelectedBet({ kind: 'number', value: n })} style={getButtonStyle('number', n)}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-pink-500/40 p-6 text-white text-center max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-pink-400 mb-4">{t("Game Rules")}</h2>
        <ul className="space-y-2 text-sm leading-relaxed text-gray-200">
          <li>• {t("Choose a bet type: number, color, even/odd, or dozen.")}</li>
          <li>• {t("Set your stake amount using the +100 / -100 buttons.")}</li>
          <li>• {t("Press")} <span className="text-yellow-400 font-semibold">{t("Spin")}</span> {t("to play — the wheel will spin and stop on a number.")}</li>
          <li>• {t("If your bet matches the winning outcome, you win based on the payout multiplier")}:</li>
          <li className="ml-4 text-gray-300">
            - {t("Single number")}: <span className="text-green-400 font-semibold">x35</span><br/>
            - {t("Color / Even-Odd")}: <span className="text-green-400 font-semibold">x2</span><br/>
            - {t("Dozen")}: <span className="text-green-400 font-semibold">x3</span>
          </li>
          <li>• {t("If you lose, your stake is subtracted from your balance.")}</li>
        </ul>
      </div>
    </div>
  );
}
