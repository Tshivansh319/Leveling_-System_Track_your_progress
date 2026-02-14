# 🎮 Solo System - Cyberpunk Task Tracker

A gamified task tracking system with a stunning cyberpunk aesthetic featuring neon blue colors, animated grid backgrounds, and real-time data synchronization across devices.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178c6.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8.svg)

# Demo Link
https://level-system-chi.vercel.app/

use shiva319
to login to demo account

## ✨ Features

### 🎯 Core Functionality
- **Leveling System**: Progress from Rank E to S (Level 1-45+)
- **XP & Progression**: Earn 8-10 XP per completed task
- **Daily Quests**: 9 permanent daily tasks including coding, exercise, and self-improvement
- **Custom Tasks**: Add unlimited custom missions on-the-fly
- **Streak Tracking**: Track consecutive days of completing all daily tasks
- **Discipline System**: Penalties for breaking discipline (-2 levels) or eating junk food (-3 levels)

### 🌐 Real-Time Sync
- **Cross-Device Sync**: Access your data from any device using personal codes
- **Auto-Sync**: Real-time data synchronization every 3 seconds
- **Persistent Storage**: All progress saved to Supabase backend
- **No Email Required**: Simple personal code authentication system

### 📊 Progress Tracking
- **Visual Charts**: Beautiful recharts visualization of your progress
- **Multiple Views**: Daily (7 days), Weekly (28 days), Monthly (90 days)
- **Historical Data**: Track level progression, tasks completed, and streaks over time
- **Automatic History**: Progress automatically saved daily at midnight

### 🎨 Cyberpunk Design
- **Neon Blue Theme**: Eye-catching #0A84FF color scheme
- **Animated Backgrounds**: Moving dot and grid patterns
- **Glowing Effects**: Pulsing frames and text shadows
- **Responsive Design**: Fully responsive on desktop and mobile
- **Live IST Clock**: Real-time Indian Standard Time display

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works!)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/solo-system.git
cd solo-system
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
# or
yarn install
```

3. **Set up Supabase**

   a. Create a new project at [supabase.com](https://supabase.com)
   
   b. Go to Project Settings → API to find your:
      - Project URL
      - Anon/Public Key
      - Service Role Key
   
   c. Update `/utils/supabase/info.tsx` with your credentials:
   ```tsx
   export const projectId = "your-project-id"
   export const publicAnonKey = "your-anon-key"
   ```
   
   d. Set up environment variables in your Supabase Edge Functions:
      - `SUPABASE_URL`
      - `SUPABASE_ANON_KEY`
      - `SUPABASE_SERVICE_ROLE_KEY`
      - `SUPABASE_DB_URL`

4. **Deploy the Edge Function**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Deploy the function
supabase functions deploy make-server-aae8dea8
```

5. **Run the development server**
```bash
npm run dev
# or
pnpm dev
```

6. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Enter any personal code to start tracking!

## 📁 Project Structure

```
solo-system/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Main application component
│   │   └── components/
│   │       ├── figma/
│   │       │   └── ImageWithFallback.tsx
│   │       └── ui/                    # Reusable UI components
│   └── styles/
│       ├── index.css
│       ├── tailwind.css
│       ├── theme.css
│       └── fonts.css
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx              # Hono web server
│           └── kv_store.tsx           # Key-value store utilities
├── utils/
│   └── supabase/
│       └── info.tsx                   # Supabase configuration
└── package.json
```

## 🎮 How to Use

### First Time Setup
1. Open the app and enter a unique personal code (e.g., your name, username)
2. Your code will be saved locally and sync your data across devices
3. Use the same code on any device to access your progress

### Daily Tasks
- Check off the 9 permanent daily quests as you complete them
- Each completed task gives you 8-10 XP
- Complete all daily tasks to maintain your streak 🔥

### Custom Tasks
- Add custom missions using the input field
- Track one-time or temporary goals
- Custom tasks also give XP when completed

### Discipline Checks
- **Junk Food**: -2 levels if you spent money on junk food
- **Discipline Break**: -3 levels if you broke your discipline
- Use these honestly to maintain accountability!

### Progress Charts
- Click the "📊 PROGRESS" button (bottom right)
- View your progression over time
- Switch between Daily/Weekly/Monthly views

## 🛠️ Tech Stack

- **Frontend**: React 18.3.1 + TypeScript
- **Styling**: Tailwind CSS 4.0
- **Charts**: Recharts
- **Backend**: Supabase Edge Functions (Hono)
- **Database**: Supabase PostgreSQL
- **Build Tool**: Vite
- **Routing**: React Router (Data Mode)

## 🔧 Configuration

### Rank Thresholds
```typescript
Level 1-11:  Rank E
Level 12-15: Rank D
Level 16-20: Rank C
Level 21-30: Rank B
Level 31-45: Rank A
Level 46+:   Rank S
```

### XP Formula
```typescript
XP Required = 100 + (level - 1) × 20
```

### Daily Tasks
1. Wake up at 5 AM
2. Squats
3. Pushups
4. Situps
5. 6–7 AM Walking
6. 40+ Min Editing
7. 90+ Min Coding
8. 1 LeetCode Problem
9. Language Practice

## 🌐 API Endpoints

The backend runs on Supabase Edge Functions with these endpoints:

- `POST /make-server-aae8dea8/save` - Save user data
- `GET /make-server-aae8dea8/load` - Load user data
- `POST /make-server-aae8dea8/progress` - Save progress entry
- `GET /make-server-aae8dea8/progress` - Get progress history

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by RPG leveling systems and cyberpunk aesthetics
- Built with [Figma Make](https://figma.com) - AI-powered web app builder
- Powered by [Supabase](https://supabase.com) for backend infrastructure

## 📧 Contact

Have questions or suggestions? Feel free to open an issue or reach out!

---

**Made with ⚡ by [Shivansh Tiwari]**

*Level up your life, one task at a time!* 🚀
