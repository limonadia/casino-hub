import React, { useState, useEffect, useRef } from 'react';
import { Coins, Trophy, Zap, Star, Crown, Gem, Users, TrendingUp, Gift, Settings } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// TypeScript Interfaces
interface Player {
  id: string;
  username: string;
  balance: number;
  totalWins: number;
  totalBets: number;
  gamesPlayed: number;
  winStreak: number;
  freeSpins: number;
  level: number;
  experience: number;
  createdAt: string;
  lastActive: string;
}

interface SpinResult {
  success: boolean;
  symbols: number[];
  winAmount: number;
  newBalance: number;
  freeSpins: number;
  winType: string;
  message: string;
  jackpotWin: boolean;
  multiplier: number;
  winStreak: number;
  experience: number;
}

interface JackpotInfo {
  amount: number;
  lastWinner?: string;
  lastWinTime?: string;
}

interface GameStats {
  totalPlayers: number;
  totalSpins: number;
  totalWinnings: number;
  biggestWin: number;
  activePlayers: number;
  jackpotAmount: number;
}

interface LeaderboardEntry {
  username: string;
  totalWins: number;
  level: number;
  gamesPlayed: number;
}

// API Service
const apiService = {
  createPlayer: async (username: string): Promise<Player> => {
    const response = await fetch(`${API_BASE_URL}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    return response.json();
  },
  
  getPlayer: async (playerId: string): Promise<Player> => {
    const response = await fetch(`${API_BASE_URL}/players/${playerId}`);
    return response.json();
  },
  
  spin: async (playerId: string, betAmount: number): Promise<SpinResult> => {
    const response = await fetch(`${API_BASE_URL}/spin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, betAmount })
    });
    return response.json();
  },
  
  getJackpot: async (): Promise<JackpotInfo> => {
    const response = await fetch(`${API_BASE_URL}/jackpot`);
    return response.json();
  },
  
  getStats: async (): Promise<GameStats> => {
    const response = await fetch(`${API_BASE_URL}/stats`);
    return response.json();
  },
  
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const response = await fetch(`${API_BASE_URL}/leaderboard`);
    return response.json();
  },
  
  claimDailyBonus: async (playerId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/players/${playerId}/daily-bonus`, {
      method: 'POST'
    });
    return response.json();
  },
  
  addFunds: async (playerId: string, amount: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/players/${playerId}/funds/${amount}`, {
      method: 'POST'
    });
    return response.json();
  }
};

// Components
interface SlotReelProps {
  symbols?: any[];
  isSpinning: boolean;
  finalSymbol: number;
  reelIndex: number;
  spinDuration: number;
}

const SlotReel: React.FC<SlotReelProps> = ({ isSpinning, finalSymbol, reelIndex, spinDuration }) => {
  const [currentSymbol, setCurrentSymbol] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const SYMBOL_EMOJIS = ['🍒', '🍋', '🔔', '💎', '⭐', '👑'];

  useEffect(() => {
    if (isSpinning) {
      intervalRef.current = setInterval(() => {
        setCurrentSymbol(prev => (prev + 1) % SYMBOL_EMOJIS.length);
      }, 100);

      setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setCurrentSymbol(finalSymbol);
      }, spinDuration + reelIndex * 300);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSpinning, finalSymbol, reelIndex, spinDuration]);

  return (
    <div className="relative w-24 h-32 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg border-2 border-yellow-500 overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-transparent"></div>
      <div className={`flex items-center justify-center h-full transition-all duration-300 ${isSpinning ? 'animate-bounce' : ''}`}>
        <div className="text-4xl drop-shadow-lg">
          {SYMBOL_EMOJIS[currentSymbol]}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
    </div>
  );
};

interface WinAnimationProps {
  show: boolean;
  amount: number;
  type: string;
}

const WinAnimation: React.FC<WinAnimationProps> = ({ show, amount, type }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className={`animate-pulse text-6xl font-bold ${
        type === 'jackpot' ? 'text-yellow-400' : 
        type === 'mega' ? 'text-purple-400' :
        type === 'big' ? 'text-blue-400' : 'text-green-400'
      } drop-shadow-2xl`}>
        {type === 'jackpot' && '🎰 JACKPOT! 🎰'}
        {type === 'mega' && '💎 MEGA WIN! 💎'}
        {type === 'big' && '⭐ BIG WIN! ⭐'}
        {type === 'normal' && `🎉 WIN $${amount}! 🎉`}
      </div>
    </div>
  );
};

interface LoginScreenProps {
  onLogin: (player: Player) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setIsLoading(true);
    try {
      const player = await apiService.createPlayer(username);
      onLogin(player);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-8 border-4 border-yellow-500 shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-2">
            🎰 ROYAL CASINO 🎰
          </h1>
          <p className="text-gray-300">Enter the world of premium gaming</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-yellow-300 text-sm font-bold mb-2">
              Choose Your Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:scale-100"
          >
            {isLoading ? 'Creating Account...' : 'Start Playing'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>🎁 New players get $10,000 starting balance!</p>
        </div>
      </div>
    </div>
  );
};

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  currentPlayer: Player | null;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard, currentPlayer }) => {
  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 border-2 border-slate-600">
      <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-center flex items-center justify-center gap-2">
        <Trophy className="w-6 h-6" />
        TOP WINNERS
      </h3>
      <div className="space-y-2">
        {leaderboard.map((player, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg ${
              player.username === currentPlayer?.username
                ? 'bg-yellow-600/20 border border-yellow-500'
                : 'bg-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-2xl ${
                index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏆'
              }`}>
                {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </span>
              <div>
                <div className="text-white font-bold">{player.username}</div>
                <div className="text-gray-400 text-sm">Level {player.level}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-bold">${player.totalWins.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">{player.gamesPlayed} games</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CasinoApp: React.FC = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [reelResults, setReelResults] = useState<number[]>([0, 0, 0, 0, 0]);
  const [bet, setBet] = useState<number>(100);
  const [lastWin, setLastWin] = useState<number>(0);
  const [jackpot, setJackpot] = useState<JackpotInfo>({ amount: 500000 });
  const [gameStats, setGameStats] = useState<GameStats>({
    totalPlayers: 0,
    totalSpins: 0,
    totalWinnings: 0,
    biggestWin: 0,
    activePlayers: 0,
    jackpotAmount: 500000
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showWinAnimation, setShowWinAnimation] = useState<boolean>(false);
  const [winType, setWinType] = useState<string>('normal');
  const [message, setMessage] = useState<string>('');
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jackpotData, statsData, leaderboardData] = await Promise.all([
          apiService.getJackpot(),
          apiService.getStats(),
          apiService.getLeaderboard()
        ]);
        
        setJackpot(jackpotData);
        setGameStats(statsData);
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    if (player) {
      fetchData();
      const interval = setInterval(fetchData, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [player]);

  const handleLogin = (playerData: Player) => {
    setPlayer(playerData);
  };

  const handleSpin = async () => {
    if (isSpinning || !player || player.balance < bet) return;

    setIsSpinning(true);
    setMessage('');
    setLastWin(0);

    try {
      // Simulate spin animation delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await apiService.spin(player.id, bet);
      
      if (!result.success) {
        setMessage(result.message);
        setIsSpinning(false);
        return;
      }

      setReelResults(result.symbols);
      
      // Wait for reel animation to complete
      setTimeout(() => {
        setIsSpinning(false);
        
        // Update player data
        setPlayer(prev => prev ? ({
          ...prev,
          balance: result.newBalance,
          freeSpins: result.freeSpins,
          winStreak: result.winStreak,
          experience: result.experience
        }) : null);
        
        setLastWin(result.winAmount);
        setWinType(result.winType);
        setMessage(result.message);
        
        if (result.winAmount > 0) {
          setShowWinAnimation(true);
          setTimeout(() => setShowWinAnimation(false), 3000);
        }
        
        // Refresh jackpot if it was won
        if (result.jackpotWin) {
          apiService.getJackpot().then(setJackpot);
        }
      }, 3500);
      
    } catch (error) {
      console.error('Spin failed:', error);
      setMessage('Spin failed. Please try again.');
      setIsSpinning(false);
    }
  };

  const handleClaimDailyBonus = async () => {
    if (!player) return;
    try {
      const result = await apiService.claimDailyBonus(player.id);
      if (result.success) {
        setPlayer(prev => prev ? ({
          ...prev,
          balance: result.newBalance,
          freeSpins: prev.freeSpins + result.freeSpins
        }) : null);
        setMessage(result.message);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error('Failed to claim bonus:', error);
      setMessage('Failed to claim bonus. Please try again.');
    }
  };

  const handleAddFunds = async (amount: number) => {
    if (!player) return;
    try {
      const result = await apiService.addFunds(player.id, amount);
      if (result.success) {
        setPlayer(prev => prev ? ({
          ...prev,
          balance: result.newBalance
        }) : null);
        setMessage(result.message);
      }
    } catch (error) {
      console.error('Failed to add funds:', error);
      setMessage('Failed to add funds. Please try again.');
    }
  };

  if (!player) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <WinAnimation show={showWinAnimation} amount={lastWin} type={winType} />
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-2">
          🎰 ROYAL CASINO 🎰
        </h1>
        <div className="text-yellow-300 text-lg">Welcome back, {player.username}!</div>
        <div className="text-gray-400 text-sm">Level {player.level} • {player.experience} XP</div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-4 text-center">
            <Coins className="w-8 h-8 mx-auto mb-2 text-white" />
            <div className="text-xl font-bold text-white">${player.balance.toLocaleString()}</div>
            <div className="text-green-100 text-xs">Balance</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-white" />
            <div className="text-xl font-bold text-white">${jackpot.amount.toLocaleString()}</div>
            <div className="text-purple-100 text-xs">Jackpot</div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-4 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-white" />
            <div className="text-xl font-bold text-white">{player.freeSpins}</div>
            <div className="text-blue-100 text-xs">Free Spins</div>
          </div>

          <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-white" />
            <div className="text-xl font-bold text-white">{player.winStreak}</div>
            <div className="text-orange-100 text-xs">Win Streak</div>
          </div>

          <div className="bg-gradient-to-r from-pink-600 to-pink-500 rounded-lg p-4 text-center">
            <Gem className="w-8 h-8 mx-auto mb-2 text-white" />
            <div className="text-xl font-bold text-white">${lastWin.toLocaleString()}</div>
            <div className="text-pink-100 text-xs">Last Win</div>
          </div>

          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-lg p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-white" />
            <div className="text-xl font-bold text-white">{gameStats.activePlayers || 0}</div>
            <div className="text-indigo-100 text-xs">Online</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Game Area */}
        <div className="lg:col-span-3">
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-8 mb-8 border-4 border-yellow-500 shadow-2xl">
            {/* Slot Reels */}
            <div className="flex justify-center gap-4 mb-8">
              {reelResults.map((symbolIndex, reelIndex) => (
                <SlotReel
                  key={reelIndex}
                  isSpinning={isSpinning}
                  finalSymbol={symbolIndex}
                  reelIndex={reelIndex}
                  spinDuration={2000}
                />
              ))}
            </div>

            {/* Payline */}
            <div className="flex justify-center mb-8">
              <div className="w-full max-w-md h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full"></div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center space-y-6">
              {/* Bet Controls */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setBet(Math.max(10, bet - 50))}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                  disabled={isSpinning}
                >
                  -$50
                </button>
                <div className="text-2xl font-bold text-yellow-400 min-w-[120px] text-center">
                  Bet: ${bet}
                </div>
                <button
                  onClick={() => setBet(Math.min(1000, bet + 50))}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                  disabled={isSpinning}
                >
                  +$50
                </button>
                <button
                  onClick={() => setBet(1000)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                  disabled={isSpinning}
                >
                  Max Bet
                </button>
              </div>

              {/* Spin Button */}
              <button
                onClick={handleSpin}
                disabled={isSpinning || player.balance < bet}
                className={`px-16 py-6 text-2xl font-bold rounded-2xl transition-all transform ${
                  isSpinning || (player.balance < bet && player.freeSpins === 0)
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white shadow-2xl hover:scale-105 active:scale-95'
                }`}
              >
                {isSpinning ? '🎰 SPINNING...' : player.freeSpins > 0 ? '🎁 FREE SPIN!' : '🎰 SPIN!'}
              </button>

              {/* Message */}
              {message && (
                <div className="text-center text-yellow-300 text-lg font-bold animate-pulse">
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleClaimDailyBonus}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg transition-all"
            >
              <Gift className="w-5 h-5" />
              Daily Bonus
            </button>
            
            <button
              onClick={() => handleAddFunds(1000)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg transition-all"
            >
              <Coins className="w-5 h-5" />
              Add $1,000
            </button>
            
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-lg transition-all"
            >
              <TrendingUp className="w-5 h-5" />
              Leaderboard
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Paytable */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 border-2 border-slate-600">
            <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">💰 PAYTABLE</h3>
            <div className="space-y-2">
              {[
                { emoji: '🍒', name: 'Cherry', multiplier: '2x' },
                { emoji: '🍋', name: 'Lemon', multiplier: '3x' },
                { emoji: '🔔', name: 'Bell', multiplier: '5x' },
                { emoji: '💎', name: 'Diamond', multiplier: '10x' },
                { emoji: '⭐', name: 'Star', multiplier: '15x' },
                { emoji: '👑', name: 'Crown', multiplier: '25x' }
              ].map((symbol, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-700 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{symbol.emoji}</span>
                    <span className="text-white text-sm">{symbol.name}</span>
                  </div>
                  <span className="text-yellow-400 font-bold text-sm">{symbol.multiplier}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-gray-300 text-xs">
              Match 3+ symbols to win! • 5 of a kind = 10x multiplier
            </div>
          </div>

          {/* Player Stats */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 border-2 border-slate-600">
            <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">📊 YOUR STATS</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Games Played:</span>
                <span className="text-white font-bold">{player.gamesPlayed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Wins:</span>
                <span className="text-green-400 font-bold">${player.totalWins.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Bets:</span>
                <span className="text-red-400 font-bold">${player.totalBets.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Net Profit:</span>
                <span className={`font-bold ${(player.totalWins - player.totalBets) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${(player.totalWins - player.totalBets).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Level:</span>
                <span className="text-purple-400 font-bold">{player.level}</span>
              </div>
            </div>
          </div>

          {/* Live Stats */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 border-2 border-slate-600">
            <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">🌐 LIVE CASINO</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Players Online:</span>
                <span className="text-green-400 font-bold">{gameStats.activePlayers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Spins:</span>
                <span className="text-white font-bold">{gameStats.totalSpins?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Biggest Win:</span>
                <span className="text-yellow-400 font-bold">${gameStats.biggestWin?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Players:</span>
                <span className="text-blue-400 font-bold">{gameStats.totalPlayers || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 border-2 border-slate-600">
            <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">⚡ QUICK ACTIONS</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleAddFunds(5000)}
                className="w-full py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg transition-all text-sm"
              >
                💰 Add $5,000
              </button>
              <button
                onClick={() => setBet(10)}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg transition-all text-sm"
                disabled={isSpinning}
              >
                🎯 Min Bet ($10)
              </button>
              <button
                onClick={() => setBet(player.balance)}
                className="w-full py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-lg transition-all text-sm"
                disabled={isSpinning || player.balance === 0}
              >
                🚀 All In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setShowLeaderboard(false)}
                className="text-white hover:text-yellow-400 text-2xl"
              >
                ✕
              </button>
            </div>
            <Leaderboard leaderboard={leaderboard} currentPlayer={player} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-12 text-center text-gray-400 text-sm">
        <div className="border-t border-gray-700 pt-8">
          <p>🎰 Royal Casino - Premium Gaming Experience</p>
          <p className="mt-2">Play Responsibly • 18+ Only • For Entertainment Purposes</p>
        </div>
      </div>
    </div>
  );
};

export default CasinoApp;