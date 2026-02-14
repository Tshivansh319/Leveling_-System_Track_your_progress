import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-aae8dea8`;

interface Task {
  name: string;
  done: boolean;
}

interface SystemData {
  level: number;
  xp: number;
  streak: number;
  lastDate: string;
  dailyQuests: Task[];
  customTasks: Task[];
}

interface ProgressEntry {
  date: string;
  level: number;
  xp: number;
  tasksCompleted: number;
  streak: number;
}

const permanentDailyQuests = [
  "Wake up at 5 AM",
  "Squats",
  "Pushups",
  "Situps",
  "6–7 AM Walking",
  "40+ Min Editing",
  "90+ Min Coding",
  "1 LeetCode Problem",
  "Language Practice"
];

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastDate, setLastDate] = useState(new Date().toDateString());
  const [dailyQuests, setDailyQuests] = useState<Task[]>([]);
  const [customTasks, setCustomTasks] = useState<Task[]>([]);
  const [newTaskInput, setNewTaskInput] = useState("");
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [showChart, setShowChart] = useState(false);
  const [chartView, setChartView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [progressData, setProgressData] = useState<ProgressEntry[]>([]);

  useEffect(() => {
    // Check if user ID is stored in localStorage
    const storedUserId = localStorage.getItem('soloSystemUserId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadData();
      // Poll for updates every 3 seconds for real-time sync
      const pollInterval = setInterval(loadData, 3000);
      // Check daily reset every minute
      const resetInterval = setInterval(checkDailyReset, 60000);
      return () => {
        clearInterval(pollInterval);
        clearInterval(resetInterval);
      };
    }
  }, [userId]);

  // Clock update - Indian Time (IST - GMT+5:30)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const istTime = new Date(now.getTime() + istOffset + (now.getTimezoneOffset() * 60 * 1000));
      
      const hours = istTime.getHours().toString().padStart(2, '0');
      const minutes = istTime.getMinutes().toString().padStart(2, '0');
      const seconds = istTime.getSeconds().toString().padStart(2, '0');
      
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };

    updateClock();
    const clockInterval = setInterval(updateClock, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Load progress data when showing chart
  useEffect(() => {
    if (showChart && userId) {
      loadProgressData();
    }
  }, [showChart, userId]);

  const loadProgressData = async () => {
    try {
      const response = await fetch(`${API_BASE}/progress?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      setProgressData(data.progress || []);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    }
  };

  const saveProgressEntry = async () => {
    const tasksCompleted = [...dailyQuests, ...customTasks].filter(t => t.done).length;
    const entry: ProgressEntry = {
      date: new Date().toISOString().split('T')[0],
      level,
      xp,
      tasksCompleted,
      streak
    };

    try {
      await fetch(`${API_BASE}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, entry })
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const getChartData = () => {
    if (!progressData.length) return [];
    
    const now = new Date();
    let filteredData = [...progressData];
    
    if (chartView === 'daily') {
      // Last 7 days
      filteredData = progressData.slice(-7);
    } else if (chartView === 'weekly') {
      // Last 4 weeks (28 days)
      filteredData = progressData.slice(-28);
    } else if (chartView === 'monthly') {
      // Last 90 days (3 months)
      filteredData = progressData.slice(-90);
    }
    
    return filteredData.map(entry => ({
      ...entry,
      date: new Date(entry.date).toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));
  };

  const xpRequired = (lvl: number) => {
    return 100 + (lvl - 1) * 20;
  };

  const getRank = (lvl: number) => {
    if (lvl <= 11) return "E";
    if (lvl <= 15) return "D";
    if (lvl <= 20) return "C";
    if (lvl <= 30) return "B";
    if (lvl <= 45) return "A";
    return "S";
  };

  const loadData = async () => {
    try {
      const response = await fetch(`${API_BASE}/load?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();

      if (data.exists) {
        setLevel(data.level);
        setXp(data.xp);
        setStreak(data.streak);
        setLastDate(data.lastDate);
        setDailyQuests(data.dailyQuests);
        setCustomTasks(data.customTasks);
      } else {
        initializeFresh();
      }
    } catch (error) {
      console.error('Load error:', error);
      initializeFresh();
    }
  };

  const initializeFresh = () => {
    const quests = permanentDailyQuests.map(q => ({ name: q, done: false }));
    setDailyQuests(quests);
    setCustomTasks([]);
    saveData(1, 0, 0, new Date().toDateString(), quests, []);
  };

  const saveData = async (
    lvl: number,
    xpVal: number,
    streakVal: number,
    date: string,
    quests: Task[],
    customs: Task[]
  ) => {
    try {
      await fetch(`${API_BASE}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          level: lvl,
          xp: xpVal,
          streak: streakVal,
          lastDate: date,
          dailyQuests: quests,
          customTasks: customs
        })
      });
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const addXP = (amount: number) => {
    let newXp = xp + amount;
    let newLevel = level;

    while (newXp >= xpRequired(newLevel)) {
      newXp -= xpRequired(newLevel);
      newLevel++;
      showPopup("LEVEL UP");
    }

    setXp(newXp);
    setLevel(newLevel);
    saveData(newLevel, newXp, streak, lastDate, dailyQuests, customTasks);
  };

  const showPopup = (text: string) => {
    setPopupText(text);
    setShowLevelUp(true);
    setTimeout(() => setShowLevelUp(false), 2000);
  };

  const toggleDaily = (index: number) => {
    if (!dailyQuests[index].done) {
      const updated = [...dailyQuests];
      updated[index].done = true;
      setDailyQuests(updated);
      addXP(Math.floor(Math.random() * 3) + 8);
    }
  };

  const toggleCustom = (index: number) => {
    if (!customTasks[index].done) {
      const updated = [...customTasks];
      updated[index].done = true;
      setCustomTasks(updated);
      addXP(Math.floor(Math.random() * 3) + 8);
    }
  };

  const addTask = () => {
    const text = newTaskInput.trim();
    if (!text) return;

    const updated = [...customTasks, { name: text, done: false }];
    setCustomTasks(updated);
    setNewTaskInput("");
    saveData(level, xp, streak, lastDate, dailyQuests, updated);
  };

  const disciplineCheck = (type: 'junk' | 'discipline') => {
    let newLevel = level;

    if (type === 'junk') {
      newLevel = Math.max(1, level - 2);
      showPopup("-2 LEVELS");
    }

    if (type === 'discipline') {
      newLevel = Math.max(1, level - 3);
      showPopup("-3 LEVELS");
    }

    setLevel(newLevel);
    setXp(0);
    saveData(newLevel, 0, streak, lastDate, dailyQuests, customTasks);
  };

  const checkDailyReset = () => {
    const today = new Date().toDateString();

    if (lastDate !== today) {
      const newStreak = dailyQuests.every(q => q.done) ? streak + 1 : 0;

      const resetDaily = permanentDailyQuests.map(q => ({ name: q, done: false }));
      const resetCustom = customTasks.map(t => ({ name: t.name, done: false }));

      // Save progress entry for yesterday before resetting
      saveProgressEntry();

      setStreak(newStreak);
      setDailyQuests(resetDaily);
      setCustomTasks(resetCustom);
      setLastDate(today);
      saveData(level, xp, newStreak, today, resetDaily, resetCustom);
    }
  };

  const handleLogin = () => {
    const code = userInput.trim();
    if (!code) return;
    
    // Save to localStorage so user stays logged in
    localStorage.setItem('soloSystemUserId', code);
    setUserId(code);
    setUserInput("");
  };

  const handleLogout = () => {
    localStorage.removeItem('soloSystemUserId');
    setUserId(null);
    // Reset state
    setLevel(1);
    setXp(0);
    setStreak(0);
    setDailyQuests([]);
    setCustomTasks([]);
  };

  // If not logged in, show login screen
  if (!userId) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-[radial-gradient(circle_at_center,#001a33_0%,#000814_75%)]">
        {/* Animated Dot Background Outside */}
        <div className="fixed inset-0 opacity-20 pointer-events-none animate-[moveDots_35s_linear_infinite]" 
             style={{
               backgroundImage: 'radial-gradient(#0A84FF 1px, transparent 1px)',
               backgroundSize: '40px 40px'
             }} 
        />

        {/* Line Grid Background Outside */}
        <div className="fixed inset-0 opacity-15 pointer-events-none animate-[moveGrid_20s_linear_infinite]"
             style={{
               backgroundImage: 'linear-gradient(#0A84FF 1px, transparent 1px), linear-gradient(90deg, #0A84FF 1px, transparent 1px)',
               backgroundSize: '50px 50px'
             }}
        />

        {/* Outer Frame */}
        <div className="fixed inset-3 md:inset-5 border-4 md:border-[6px] border-[#0A84FF] pointer-events-none animate-[glowPulse_2s_infinite_alternate]"
             style={{
               boxShadow: '0 0 60px #0A84FF, 0 0 160px #003C8F, inset 0 0 80px #0A84FF'
             }}
        />

        {/* Login Panel */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative w-full max-w-[500px] px-8 py-10 bg-[rgba(0,20,40,0.95)] border-4 border-[#0A84FF]"
               style={{
                 boxShadow: '0 0 60px #0A84FF, inset 0 0 90px rgba(10,132,255,0.8)'
               }}>
            
            {/* Grid Background Inside Panel */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                 style={{
                   backgroundImage: 'linear-gradient(#0A84FF 1px, transparent 1px), linear-gradient(90deg, #0A84FF 1px, transparent 1px)',
                   backgroundSize: '30px 30px'
                 }}
            />

            <h1 className="relative text-center text-2xl md:text-3xl tracking-[6px] mb-6 text-[#6FC3FF]"
                style={{
                  textShadow: '0 0 30px #0A84FF, 0 0 100px #003C8F'
                }}>
              SOLO SYSTEM
            </h1>

            <p className="relative text-center text-sm md:text-base mb-8 text-[#6FC3FF] opacity-80"
               style={{ textShadow: '0 0 15px #0A84FF' }}>
              Enter your personal code to access your data from any device
            </p>

            <div className="relative flex flex-col gap-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter your code..."
                className="w-full px-4 py-3 bg-[rgba(0,40,70,0.95)] border-2 border-[#0A84FF] text-[#6FC3FF] text-center text-lg outline-none"
                style={{ textShadow: '0 0 10px #0A84FF' }}
              />
              <button
                onClick={handleLogin}
                className="w-full px-6 py-3 bg-[#003C8F] border-2 border-[#0A84FF] text-[#6FC3FF] text-lg cursor-pointer hover:shadow-[0_0_70px_#0A84FF]"
                style={{ 
                  boxShadow: '0 0 25px #0A84FF',
                  textShadow: '0 0 15px #0A84FF'
                }}>
                ENTER
              </button>
            </div>

            <p className="relative text-center text-xs md:text-sm mt-6 text-[#6FC3FF] opacity-60"
               style={{ textShadow: '0 0 10px #0A84FF' }}>
              Use any unique code (e.g., your name, username, or random text)
            </p>
          </div>
        </div>

        <style>{`
          @keyframes moveDots {
            from { background-position: 0 0; }
            to { background-position: 700px 700px; }
          }
          @keyframes moveGrid {
            from { background-position: 0 0; }
            to { background-position: 500px 500px; }
          }
          @keyframes glowPulse {
            from { box-shadow: 0 0 40px #0A84FF, 0 0 120px #003C8F; }
            to { box-shadow: 0 0 80px #0A84FF, 0 0 220px #003C8F; }
          }
        `}</style>
      </div>
    );
  }

  const allTasks = [...dailyQuests, ...customTasks];
  const col1 = allTasks.slice(0, 6);
  const col2 = allTasks.slice(6, 12);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[radial-gradient(circle_at_center,#001a33_0%,#000814_75%)]">
      {/* Animated Dot Background Outside */}
      <div className="fixed inset-0 opacity-20 pointer-events-none animate-[moveDots_35s_linear_infinite]" 
           style={{
             backgroundImage: 'radial-gradient(#0A84FF 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }} 
      />

      {/* Line Grid Background Outside */}
      <div className="fixed inset-0 opacity-15 pointer-events-none animate-[moveGrid_20s_linear_infinite]"
           style={{
             backgroundImage: 'linear-gradient(#0A84FF 1px, transparent 1px), linear-gradient(90deg, #0A84FF 1px, transparent 1px)',
             backgroundSize: '50px 50px'
           }}
      />

      {/* Outer Frame */}
      <div className="fixed inset-3 md:inset-5 border-4 md:border-[6px] border-[#0A84FF] pointer-events-none animate-[glowPulse_2s_infinite_alternate]"
           style={{
             boxShadow: '0 0 60px #0A84FF, 0 0 160px #003C8F, inset 0 0 80px #0A84FF'
           }}
      />

      {/* Indian Time Clock - Top Left Corner */}
      <div className="fixed top-6 left-6 md:top-8 md:left-8 px-4 py-2 md:px-6 md:py-3 bg-[rgba(0,20,40,0.95)] border-2 border-[#0A84FF] z-20"
           style={{
             boxShadow: '0 0 30px #0A84FF, inset 0 0 40px rgba(10,132,255,0.6)'
           }}>
        <div className="text-xs md:text-sm text-[#6FC3FF] opacity-70 mb-1"
             style={{ textShadow: '0 0 10px #0A84FF' }}>
          IST (GMT+5:30)
        </div>
        <div className="text-lg md:text-2xl font-bold text-[#6FC3FF]"
             style={{ textShadow: '0 0 20px #0A84FF, 0 0 60px #003C8F' }}>
          {currentTime}
        </div>
      </div>

      {/* Progress Chart Button - Bottom Right Corner */}
      <button
        onClick={() => setShowChart(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 px-4 py-2 md:px-6 md:py-3 bg-[#003C8F] border-2 border-[#0A84FF] text-[#6FC3FF] text-sm md:text-base cursor-pointer hover:shadow-[0_0_70px_#0A84FF] z-20"
        style={{
          boxShadow: '0 0 30px #0A84FF',
          textShadow: '0 0 15px #0A84FF'
        }}>
        📊 PROGRESS
      </button>

      {/* Main System Panel - Centered */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
        <div className="relative w-full max-w-[1000px] h-full max-h-[95vh] overflow-y-auto px-4 md:px-10 py-4 md:py-6 bg-[rgba(0,20,40,0.9)] border-2 md:border-4 border-[#0A84FF] scrollbar-thin scrollbar-thumb-[#0A84FF] scrollbar-track-[rgba(0,40,70,0.5)]"
             style={{
               boxShadow: '0 0 60px #0A84FF, inset 0 0 90px rgba(10,132,255,0.8)'
             }}>
        
        {/* Grid Background Inside Panel */}
        <div className="absolute inset-0 opacity-10 pointer-events-none animate-[moveGrid_20s_linear_infinite]"
             style={{
               backgroundImage: 'linear-gradient(#0A84FF 1px, transparent 1px), linear-gradient(90deg, #0A84FF 1px, transparent 1px)',
               backgroundSize: '30px 30px'
             }}
        />

        {/* Title with Glow */}
        <h1 className="relative text-center text-xl md:text-3xl tracking-[4px] md:tracking-[8px] mb-3 md:mb-4 text-[#6FC3FF]"
            style={{
              textShadow: '0 0 30px #0A84FF, 0 0 100px #003C8F'
            }}>
          PLAYER STATUS
        </h1>

        {/* Logout Button - Top Right */}
        <button
          onClick={handleLogout}
          className="absolute top-2 right-2 md:top-4 md:right-4 px-3 md:px-4 py-1 md:py-2 bg-[#003C8F] border-2 border-[#0A84FF] text-[#6FC3FF] text-xs md:text-sm cursor-pointer hover:shadow-[0_0_50px_#0A84FF] z-10"
          style={{ 
            boxShadow: '0 0 15px #0A84FF',
            textShadow: '0 0 10px #0A84FF'
          }}>
          LOGOUT
        </button>

        {/* Stats with Glow */}
        <div className="relative flex flex-wrap justify-center gap-4 md:gap-12 text-xs md:text-base mb-3 md:mb-4 text-[#6FC3FF]"
             style={{ textShadow: '0 0 15px #0A84FF' }}>
          <div>Level: <span className="font-bold">{level}</span></div>
          <div>Rank: <span className="font-bold">{getRank(level)}</span></div>
          <div>XP: <span className="font-bold">{xp}</span> / <span className="font-bold">{xpRequired(level)}</span></div>
          <div>Streak: <span className="font-bold">{streak}</span> 🔥</div>
        </div>

        {/* XP Bar */}
        <div className="relative h-4 md:h-6 border-2 border-[#0A84FF] bg-[rgba(0,40,70,0.9)] mb-4 md:mb-5">
          <div 
            className="h-full transition-all duration-500 bg-gradient-to-r from-[#003C8F] via-[#0A84FF] to-[#6FC3FF]"
            style={{
              width: `${(xp / xpRequired(level)) * 100}%`,
              boxShadow: '0 0 40px #0A84FF, 0 0 120px #0A84FF'
            }}
          />
        </div>

        {/* Daily Tasks with Glow */}
        <h2 className="relative text-base md:text-xl mb-3 text-[#6FC3FF]"
            style={{ textShadow: '0 0 20px #0A84FF' }}>
          Daily Tasks
        </h2>

        <div className="relative flex flex-col md:flex-row justify-center gap-4 md:gap-16 mb-4 md:mb-5">
          {/* Column 1 */}
          <div className="flex flex-col gap-2">
            {col1.map((task, i) => (
              <div key={i} className="flex items-center text-xs md:text-base text-[#6FC3FF]"
                   style={{ textShadow: '0 0 10px #0A84FF' }}>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => i < dailyQuests.length ? toggleDaily(i) : toggleCustom(i - dailyQuests.length)}
                  className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 accent-[#0A84FF] cursor-pointer flex-shrink-0"
                />
                <span className={task.done ? 'line-through opacity-60' : ''}>
                  {task.name}
                </span>
              </div>
            ))}
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-2">
            {col2.map((task, i) => {
              const actualIndex = i + 6;
              return (
                <div key={i} className="flex items-center text-xs md:text-base text-[#6FC3FF]"
                     style={{ textShadow: '0 0 10px #0A84FF' }}>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => actualIndex < dailyQuests.length ? toggleDaily(actualIndex) : toggleCustom(actualIndex - dailyQuests.length)}
                    className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 accent-[#0A84FF] cursor-pointer flex-shrink-0"
                  />
                  <span className={task.done ? 'line-through opacity-60' : ''}>
                    {task.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Tasks Section */}
        <div className="relative mt-4 md:mt-5">
          <h2 className="text-base md:text-xl mb-2 md:mb-3 text-[#6FC3FF]"
              style={{ textShadow: '0 0 20px #0A84FF' }}>
            Custom Tasks
          </h2>
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <input
              type="text"
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="Add new mission..."
              className="flex-1 px-3 md:px-4 py-2 bg-[rgba(0,40,70,0.95)] border-2 border-[#0A84FF] text-[#6FC3FF] text-xs md:text-sm outline-none"
              style={{ textShadow: '0 0 10px #0A84FF' }}
            />
            <button
              onClick={addTask}
              className="px-4 md:px-6 py-2 bg-[#003C8F] border-2 border-[#0A84FF] text-[#6FC3FF] text-xs md:text-sm cursor-pointer hover:shadow-[0_0_70px_#0A84FF] whitespace-nowrap"
              style={{ 
                boxShadow: '0 0 25px #0A84FF',
                textShadow: '0 0 15px #0A84FF'
              }}>
              Add
            </button>
          </div>
        </div>

        {/* Discipline Check */}
        <div className="relative mt-4 md:mt-5 pt-3 md:pt-4 border-t-2 border-[rgba(10,132,255,0.6)]">
          <h2 className="text-base md:text-xl mb-2 md:mb-3 text-[#6FC3FF]"
              style={{ textShadow: '0 0 20px #0A84FF' }}>
            Discipline Check
          </h2>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mt-2 md:mt-3 text-xs md:text-sm text-[#6FC3FF]"
               style={{ textShadow: '0 0 10px #0A84FF' }}>
            <span className="flex-1">Did you spend money today on junk food?</span>
            <button
              onClick={() => disciplineCheck('junk')}
              className="px-4 md:px-6 py-2 bg-[#003C8F] border-2 border-[#0A84FF] text-[#6FC3FF] text-xs md:text-sm cursor-pointer hover:shadow-[0_0_80px_#0A84FF] whitespace-nowrap"
              style={{ 
                boxShadow: '0 0 25px #0A84FF',
                textShadow: '0 0 15px #0A84FF'
              }}>
              YES
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mt-2 md:mt-3 text-xs md:text-sm text-[#6FC3FF]"
               style={{ textShadow: '0 0 10px #0A84FF' }}>
            <span className="flex-1">Did you break your discipline today?</span>
            <button
              onClick={() => disciplineCheck('discipline')}
              className="px-4 md:px-6 py-2 bg-[#003C8F] border-2 border-[#0A84FF] text-[#6FC3FF] text-xs md:text-sm cursor-pointer hover:shadow-[0_0_80px_#0A84FF] whitespace-nowrap"
              style={{ 
                boxShadow: '0 0 25px #0A84FF',
                textShadow: '0 0 15px #0A84FF'
              }}>
              YES
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Level Up Popup */}
      {showLevelUp && (
        <div className="fixed top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl md:text-6xl text-[#6FC3FF] z-50"
             style={{
               textShadow: '0 0 40px #0A84FF, 0 0 120px #003C8F'
             }}>
          {popupText}
        </div>
      )}

      {/* Progress Chart Modal */}
      {showChart && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
             onClick={() => setShowChart(false)}>
          <div className="relative w-full max-w-[900px] max-h-[90vh] overflow-y-auto px-6 md:px-10 py-6 md:py-8 bg-[rgba(0,20,40,0.98)] border-4 border-[#0A84FF]"
               style={{
                 boxShadow: '0 0 80px #0A84FF, inset 0 0 100px rgba(10,132,255,0.6)'
               }}
               onClick={(e) => e.stopPropagation()}>
            
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none animate-[moveGrid_20s_linear_infinite]"
                 style={{
                   backgroundImage: 'linear-gradient(#0A84FF 1px, transparent 1px), linear-gradient(90deg, #0A84FF 1px, transparent 1px)',
                   backgroundSize: '30px 30px'
                 }}
            />

            <div className="relative">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl tracking-[4px] text-[#6FC3FF]"
                    style={{ textShadow: '0 0 30px #0A84FF' }}>
                  PROGRESS CHART
                </h2>
                <button
                  onClick={() => setShowChart(false)}
                  className="px-4 py-2 bg-[#003C8F] border-2 border-[#0A84FF] text-[#6FC3FF] text-sm cursor-pointer hover:shadow-[0_0_50px_#0A84FF]"
                  style={{
                    boxShadow: '0 0 20px #0A84FF',
                    textShadow: '0 0 10px #0A84FF'
                  }}>
                  ✕ CLOSE
                </button>
              </div>

              {/* View Toggles */}
              <div className="flex gap-2 md:gap-4 mb-6">
                <button
                  onClick={() => setChartView('daily')}
                  className={`flex-1 px-4 py-2 border-2 border-[#0A84FF] text-[#6FC3FF] text-sm md:text-base cursor-pointer transition-all ${
                    chartView === 'daily' ? 'bg-[#0A84FF] shadow-[0_0_40px_#0A84FF]' : 'bg-[#003C8F] hover:shadow-[0_0_30px_#0A84FF]'
                  }`}
                  style={{ textShadow: '0 0 10px #0A84FF' }}>
                  DAILY (7 Days)
                </button>
                <button
                  onClick={() => setChartView('weekly')}
                  className={`flex-1 px-4 py-2 border-2 border-[#0A84FF] text-[#6FC3FF] text-sm md:text-base cursor-pointer transition-all ${
                    chartView === 'weekly' ? 'bg-[#0A84FF] shadow-[0_0_40px_#0A84FF]' : 'bg-[#003C8F] hover:shadow-[0_0_30px_#0A84FF]'
                  }`}
                  style={{ textShadow: '0 0 10px #0A84FF' }}>
                  WEEKLY (28 Days)
                </button>
                <button
                  onClick={() => setChartView('monthly')}
                  className={`flex-1 px-4 py-2 border-2 border-[#0A84FF] text-[#6FC3FF] text-sm md:text-base cursor-pointer transition-all ${
                    chartView === 'monthly' ? 'bg-[#0A84FF] shadow-[0_0_40px_#0A84FF]' : 'bg-[#003C8F] hover:shadow-[0_0_30px_#0A84FF]'
                  }`}
                  style={{ textShadow: '0 0 10px #0A84FF' }}>
                  MONTHLY (90 Days)
                </button>
              </div>

              {/* Chart */}
              <div className="h-[300px] md:h-[400px] mb-4">
                {getChartData().length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0A84FF" opacity={0.2} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6FC3FF" 
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#6FC3FF" 
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(0,20,40,0.95)',
                          border: '2px solid #0A84FF',
                          borderRadius: '4px',
                          color: '#6FC3FF'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ color: '#6FC3FF' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="level" 
                        stroke="#0A84FF" 
                        strokeWidth={3}
                        dot={{ fill: '#0A84FF', r: 4 }}
                        name="Level"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="tasksCompleted" 
                        stroke="#6FC3FF" 
                        strokeWidth={2}
                        dot={{ fill: '#6FC3FF', r: 3 }}
                        name="Tasks Completed"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="streak" 
                        stroke="#FFD700" 
                        strokeWidth={2}
                        dot={{ fill: '#FFD700', r: 3 }}
                        name="Streak"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-[#6FC3FF] text-lg"
                       style={{ textShadow: '0 0 15px #0A84FF' }}>
                    No progress data yet. Complete tasks to start tracking!
                  </div>
                )}
              </div>

              <p className="text-center text-xs md:text-sm text-[#6FC3FF] opacity-70"
                 style={{ textShadow: '0 0 10px #0A84FF' }}>
                Progress is automatically saved daily at midnight
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes moveDots {
          from { background-position: 0 0; }
          to { background-position: 700px 700px; }
        }
        @keyframes moveGrid {
          from { background-position: 0 0; }
          to { background-position: 500px 500px; }
        }
        @keyframes glowPulse {
          from { box-shadow: 0 0 40px #0A84FF, 0 0 120px #003C8F; }
          to { box-shadow: 0 0 80px #0A84FF, 0 0 220px #003C8F; }
        }
        
        /* Custom scrollbar for webkit browsers */
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-thumb-\\[\\#0A84FF\\]::-webkit-scrollbar-thumb {
          background: #0A84FF;
          border-radius: 4px;
          box-shadow: 0 0 10px #0A84FF;
        }
        .scrollbar-track-\\[rgba\\(0\\,40\\,70\\,0\\.5\\)\\]::-webkit-scrollbar-track {
          background: rgba(0,40,70,0.5);
        }
      `}</style>
    </div>
  );
}