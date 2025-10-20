# 🏏 Cricket Management Application

A full-stack dynamic Cricket Web Application that manages cricket matches, dynamic teams, player statistics, and match history. Built with React, Node.js, Express, and Supabase.

This web application was built using a prompt-engineering-first approach:

- 💡 Idea + Prompts refined using **ChatGPT**
- 🔧 Initial code generation through **bolt.new**
- 🧠 Final development and refinement using **Copilot, Google Gemini, ChatGPT**

The project combines human creativity with AI-augmented development. All logic, decisions, and final code were reviewed and customized as needed.

## ✨ Features

- **Player & Team Management**: Add global players and create dynamic teams
- **Match Flow**: Complete match tracking with toss, innings, scores, and wickets
- **Automatic Winner Detection**: System determines winner and Man of the Match
- **Rematch Feature**: Reuse teams for new matches
- **Player Statistics**: Comprehensive player stats tracking
- **Match History**: Complete match history with filtering options
- **Responsive Design**: Mobile-first responsive UI

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Context API (Frontend)
- **Date Utility**: Day.js
- **Build Tool**: Vite

## 📁 Project Structure

```
CricketManagementApp/
├── frontend/              # 🎨 React Frontend Application
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── context/       # React Context for state
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # App entry point
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
│
├── backend/               # ⚙️ Node.js Backend Server
│   ├── routes/            # API routes (players, matches)
│   ├── db.js              # Supabase client setup
│   ├── db-setup.js        # Database schema initialization
│   ├── index.js           # Express server entry point
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Environment variable example
│
├── package.json           # 🎯 Root package.json (manages both)
└── README.md              # 📖 This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v16 or higher.
- **npm**: (comes with Node.js).
- **Supabase Account**: A free account at [supabase.com](https://supabase.com).

### 1. Install Dependencies

Run this command from the root `CricketManagementApp/` directory to install dependencies for both the frontend and backend.

```bash
# If you have a root package.json with an "install:all" script:
npm run install:all

# Otherwise, install for each part manually:
cd frontend && npm install
cd ../backend && npm install
cd ..
```

### 2. Database Setup

1.  Go to [supabase.com](https://supabase.com), create a new project.
2.  Find your Project URL and `anon` public key in your project's API settings.
3.  You will also need your database connection string (URI) from the database settings page.
4.  The database tables will be automatically created by running the `npm run init-db` script in the backend.

### 3. Environment Configuration

You will need to create `.env` files for both the frontend and backend.

**Frontend (`frontend/.env`):**

```env
# For local development
VITE_API_URL=http://localhost:5000

# For production (example)
# VITE_API_URL=https://your-production-url.onrender.com
```

**Backend (backend/.env):**

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=cricket_management
NODE_ENV=development
```

### 4. Start the Application

```bash
# Start both frontend and backend simultaneously
npm run dev
```

### 5. Access the Application

Open your browser and navigate to `http://localhost:5173`

## 📋 Available Commands

### Root Level Commands

```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only
npm run install:all      # Install all dependencies
npm run build            # Build frontend for production
```

### Frontend Commands (from frontend/ directory)

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Backend Commands (from backend/ directory)

```bash
npm run dev              # Start development server
npm run db:setup         # Initialize database schema
npm start                # Start production server
```

## 🔧 API Endpoints

### Players

- `GET /api/players` - Get all players
- `POST /api/players` - Add new player
- `GET /api/players/:id` - Updates an Existing player's name
- `DELETE /api/players/:id` - Deletes a player by their ID
- `GET /api/players/stats/:id` - Retrieves career statistics for a single player by their ID.
- `GET /api/players/stats/all` - Retrieves career statistics for all players

### Matches

- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get match by ID
- `POST /api/matches` - Save new match
- `GET /api/matches/:id/stats` - Get match player stats

## 🗄️ Database Schema

The database schema is automatically created and maintained by the backend server on startup. The following SQL statements represent the current structure of the tables.

### `players`

```sql
CREATE TABLE IF NOT EXISTS players (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Matches Table

```sql
CREATE TABLE IF NOT EXISTS matches (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  team_a_name VARCHAR(255) NOT NULL,
  team_b_name VARCHAR(255) NOT NULL,
  overs INT NOT NULL,
  toss_winner VARCHAR(255),
  toss_decision VARCHAR(10),
  team_a_score INT DEFAULT 0,
  team_a_wickets INT DEFAULT 0,
  team_b_score INT DEFAULT 0,
  team_b_wickets INT DEFAULT 0,
  winner VARCHAR(255),
  man_of_match VARCHAR(255),
  match_date DATE DEFAULT (CURRENT_DATE),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Match Player Stats Table

```sql
CREATE TABLE IF NOT EXISTS match_player_stats (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  match_id VARCHAR(36),
  player_id VARCHAR(36),
  team VARCHAR(255),
  runs INT DEFAULT 0,
  wickets INT DEFAULT 0,
  ones INT DEFAULT 0,
  twos INT DEFAULT 0,
  threes INT DEFAULT 0,
  fours INT DEFAULT 0,
  sixes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);
```

## 🎮 Usage

1. **Add Players**: Navigate to Player Management to add players to the global pool
2. **Create Match**: Use Match Setup to create a new match with teams and settings
3. **Play Match**: Follow the match flow to record scores and wickets
4. **View History**: Check Match History to see all completed matches
5. **Player Stats**: View comprehensive player statistics

## 🔧 Troubleshooting

### Database Connection Issues

- Make sure MySQL is running
- Check your database credentials in `backend/.env`
- Verify the database `cricket_management` exists

### Port Already in Use

- Change the PORT in `backend/.env` if 5000 is busy
- Change the frontend port in `frontend/vite.config.ts` if 5173 is busy

## 🎉 Features Implemented

- ✅ Player management (add, view, search)
- ✅ Dynamic team creation
- ✅ Match setup with toss and overs
- ✅ Live match tracking with innings
- ✅ Automatic winner detection
- ✅ Man of the Match calculation
- ✅ Match history with filtering
- ✅ Player statistics tracking
- ✅ Rematch functionality
- ✅ Responsive mobile-first design
