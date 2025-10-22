# 🏏 Multi-Tenant Cricket Management System

> **From Single Club to Multi-Club Excellence** 🚀

A comprehensive **multi-tenant cricket management platform** that evolved from a single-club system to support unlimited cricket clubs with complete data isolation, player authentication, and advanced statistics tracking.

## 🌟 **Project Evolution: Single → Multi-Tenant**

This project showcases a **real-world transformation** from a basic single-tenant application to a sophisticated multi-tenant SaaS platform:

### **Phase 1: Single-Tenant Foundation** 🏗️
- ✅ Basic player and match management
- ✅ Simple statistics tracking
- ✅ Single club operations

### **Phase 2: Multi-Tenant Revolution** 🚀
- ✅ **Complete architectural overhaul**
- ✅ **Club-based data isolation**
- ✅ **JWT-based authentication system**
- ✅ **Player self-service profiles**
- ✅ **Admin and player role separation**
- ✅ **Scalable SaaS architecture**

## 🎯 **AI-Powered Development Journey**

This project demonstrates the power of **AI-augmented development**:

- 💡 **Conceptualization**: ChatGPT for system design and architecture
- 🔧 **Rapid Prototyping**: bolt.new for initial code generation  
- 🧠 **Advanced Implementation**: Copilot, Google Gemini, and ChatGPT for complex features
- 🔄 **Iterative Refinement**: Human creativity + AI assistance for optimal solutions

**Result**: A production-ready multi-tenant system built efficiently through AI collaboration.

## ✨ **Multi-Tenant Features**

### 🏢 **Club Management**
- **Club Registration**: Self-service club registration with auto-generated admin credentials
- **Data Isolation**: Complete separation between clubs - no cross-club data access
- **Admin Dashboard**: Comprehensive club management interface
- **Password Reset**: Secure password reset for club admins

### 👥 **Player Management** 
- **Dual Authentication**: Separate login systems for admins and players
- **Player Profiles**: Self-service profile editing (DOB, country, personal info)
- **Auto-Generated Credentials**: Automatic username/password generation for new players
- **Role-Based Access**: Players see only their own data, admins manage their club

### 🏏 **Match & Statistics**
- **Dynamic Team Creation**: Flexible team formation from club players
- **Live Match Tracking**: Real-time score and wicket tracking
- **Advanced Statistics**: Comprehensive player and match analytics
- **Match History**: Complete historical data with filtering and search
- **Performance Analytics**: Batting averages, bowling figures, win percentages

### 🔐 **Security & Authentication**
- **JWT-Based Security**: Secure token-based authentication
- **Multi-Tenant Isolation**: Database-level data separation
- **Role-Based Permissions**: Admin vs Player access controls
- **Secure Password Management**: Bcrypt hashing and secure storage

### 📱 **User Experience**
- **Responsive Design**: Mobile-first, works on all devices
- **Intuitive Navigation**: Role-based navigation and dashboards
- **Real-Time Updates**: Immediate reflection of data changes
- **Professional UI**: Modern, clean interface with Tailwind CSS

## 🛠️ **Technology Stack**

### **Frontend** 🎨
- **React 18** + **TypeScript** - Modern, type-safe UI development
- **Tailwind CSS** - Utility-first styling for responsive design
- **React Router** - Client-side routing with protected routes
- **Context API** - State management for authentication and data
- **Vite** - Lightning-fast build tool and dev server

### **Backend** ⚙️
- **Node.js** + **Express** - Scalable server architecture
- **JWT Authentication** - Secure token-based auth system
- **Bcrypt** - Password hashing and security
- **Multi-tenant Architecture** - Club-based data isolation
- **RESTful APIs** - Clean, documented API endpoints

### **Database** 🗄️
- **Supabase (PostgreSQL)** - Managed database with real-time features
- **Multi-tenant Schema** - Club-scoped data with foreign key constraints
- **Automatic Migrations** - Schema updates and data migration scripts
- **Connection Pooling** - Optimized database connections

### **DevOps & Tools** 🔧
- **Environment Configuration** - Separate dev/prod configurations
- **Hot Reload** - Development efficiency with instant updates
- **TypeScript** - End-to-end type safety
- **ESLint + Prettier** - Code quality and formatting

## 📁 **Project Architecture**

```
CricketManagementApp/
├── 🎨 frontend/                    # React Multi-Tenant Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminLogin.tsx      # Club admin authentication
│   │   │   ├── ClubRegistration.tsx # Self-service club registration
│   │   │   ├── PlayerLogin.tsx     # Player authentication
│   │   │   ├── PlayerProfile.tsx   # Player profile management
│   │   │   ├── EditProfile.tsx     # Self-service profile editing
│   │   │   ├── Dashboard.tsx       # Admin dashboard
│   │   │   ├── PlayerDashboard.tsx # Player dashboard
│   │   │   ├── Navigation.tsx      # Role-based navigation
│   │   │   └── ProtectedRoute.tsx  # Route protection
│   │   ├── context/
│   │   │   ├── AuthContext.tsx     # Multi-tenant authentication
│   │   │   ├── CricketContext.tsx  # Data management
│   │   │   └── usePlayerApi.ts     # Player API hooks
│   │   ├── types/cricket.ts        # TypeScript definitions
│   │   └── App.tsx                 # Multi-tenant routing
│   └── .env                        # Frontend configuration
│
├── ⚙️ backend/                     # Node.js Multi-Tenant Backend
│   ├── routes/
│   │   ├── auth.js                 # Club & admin authentication
│   │   ├── player-auth.js          # Player authentication & profiles
│   │   ├── players.js              # Player management (admin)
│   │   └── matches.js              # Match management
│   ├── db-setup.js                 # Multi-tenant schema & migrations
│   ├── index.js                    # Express server with JWT middleware
│   └── .env                        # Backend configuration
│
└── 📖 README.md                    # This comprehensive guide
```

### **Key Architectural Decisions** 🏗️

- **Multi-Tenant Database Design**: Club-scoped tables with foreign key constraints
- **JWT Authentication**: Stateless authentication with role-based access
- **Component Separation**: Distinct admin and player interfaces
- **API Isolation**: Club-filtered endpoints preventing cross-tenant access
- **Self-Service Registration**: Automated club onboarding without manual intervention

## 🚀 **Quick Start Guide**

### **Prerequisites** 📋
- **Node.js** v16+ and **npm**
- **Supabase Account** (free tier available)
- **Git** for cloning the repository

### **1. Clone & Install** 📦
```bash
# Clone the repository
git clone https://github.com/yourusername/cricket-management-app.git
cd cricket-management-app

# Install dependencies for both frontend and backend
cd frontend && npm install
cd ../backend && npm install
```

### **2. Environment Setup** 🔧

1. **Copy environment files**:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com)
3. **Get your credentials** from Project Settings → API/Database

> **Note**: The `.env` files are not included in the repository for security. You must create them from the `.env.example` templates and add your own credentials.

### **3. Environment Configuration** ⚙️

**Backend (`backend/.env`):**
```env
# Supabase Database Connection
SUPABASE_DB_URL=postgresql://postgres:[password]@[host]:5432/postgres

# Server Configuration  
PORT=5000
NODE_ENV=development

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-here
```

**Frontend (`frontend/.env`):**
```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Optional: Supabase Client (for future features)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### **4. Initialize Database** 🔧
```bash
# Initialize multi-tenant database schema
cd backend
npm run init-db
```

### **5. Start the Application** 🚀
```bash
# Terminal 1: Start backend server
cd backend
npm run dev

# Terminal 2: Start frontend development server  
cd frontend
npm run dev
```

### **6. Access the Application** 🌐
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🎯 **Getting Started as a User**

### **For Club Admins** 👨‍💼
1. Visit the application → **"Admin Login"**
2. Click **"Register Your Cricket Club"**
3. Enter club name and admin name
4. **Save the generated credentials** (shown only once!)
5. Login and start managing your club

### **For Players** 🏏
1. Ask your club admin to **add you as a player**
2. Get your **auto-generated credentials** from admin
3. Visit the application → **"Player Login"**
4. Login and **customize your profile** (DOB, country, etc.)
5. View your **statistics and match history**

## 📋 **Available Commands**

### **Backend Commands** ⚙️
```bash
npm run dev              # Start development server with hot reload
npm run init-db          # Initialize/update multi-tenant database schema  
npm start                # Start production server
```

### **Frontend Commands** 🎨
```bash
npm run dev              # Start Vite development server
npm run build            # Build optimized production bundle
npm run preview          # Preview production build locally
npm run lint             # Run ESLint for code quality
```

### **Development Workflow** 🔄
```bash
# Full development setup
npm run init-db          # Initialize database (run once)
npm run dev              # Start both servers simultaneously
```

## 🔧 **Multi-Tenant API Documentation**

### **Authentication Endpoints** 🔐
```http
POST /api/auth/register-club     # Register new cricket club
POST /api/auth/login             # Club admin login  
POST /api/auth/reset-password    # Reset admin password
GET  /api/auth/me                # Get current admin info
```

### **Player Authentication** 👥
```http
POST /api/player/login           # Player login
GET  /api/player/profile         # Get player profile
PUT  /api/player/profile         # Update player profile (DOB, country)
GET  /api/player/history         # Get player's match history
GET  /api/player/detailed-stats  # Get player's detailed statistics
```

### **Admin Player Management** 👨‍💼
```http
GET    /api/players              # Get all club players
POST   /api/players              # Add new player (auto-generates credentials)
PUT    /api/players/:id          # Update player name
DELETE /api/players/:id          # Delete player
POST   /api/players/:id/reset-password  # Reset player password
GET    /api/players/stats/all    # Get all players' statistics
GET    /api/players/stats/:id    # Get specific player statistics
```

### **Match Management** 🏏
```http
GET    /api/matches              # Get all club matches
GET    /api/matches/:id          # Get specific match
POST   /api/matches              # Create new match
DELETE /api/matches/:id          # Delete match
GET    /api/matches/:id/stats    # Get match player statistics
```

### **API Security Features** 🛡️
- **JWT Authentication**: All endpoints require valid tokens
- **Club Isolation**: Automatic filtering by club_id
- **Role-Based Access**: Admin vs Player endpoint separation
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Consistent error responses

## 🗄️ **Multi-Tenant Database Schema**

The database automatically creates and maintains a **multi-tenant architecture** with complete data isolation between clubs.

### **Core Multi-Tenant Tables** 🏢

#### **Clubs Table**
```sql
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **Admins Table** 
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  admin_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Club-Scoped Data Tables** 🏏

#### **Players Table**
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT,
  password_hash TEXT,
  date_of_birth DATE,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT players_name_club_id_key UNIQUE(name, club_id),
  CONSTRAINT players_username_club_id_key UNIQUE(username, club_id)
);
```

#### **Matches Table**
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  team_a_name TEXT NOT NULL,
  team_b_name TEXT NOT NULL,
  overs INT NOT NULL,
  toss_winner TEXT,
  toss_decision TEXT,
  team_a_score INT DEFAULT 0,
  team_a_wickets INT DEFAULT 0,
  team_b_score INT DEFAULT 0,
  team_b_wickets INT DEFAULT 0,
  winner TEXT,
  man_of_match TEXT,
  match_date DATE DEFAULT CURRENT_DATE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **Match Player Stats Table**
```sql
CREATE TABLE match_player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team TEXT NOT NULL,
  runs INT DEFAULT 0,
  wickets INT DEFAULT 0,
  ones INT DEFAULT 0,
  twos INT DEFAULT 0,
  threes INT DEFAULT 0,
  fours INT DEFAULT 0,
  sixes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Multi-Tenant Features** 🔒
- **Data Isolation**: Every table includes `club_id` for complete separation
- **Cascading Deletes**: Automatic cleanup when clubs are removed
- **Unique Constraints**: Player names and usernames unique per club
- **Referential Integrity**: Foreign key constraints maintain data consistency
- **Automatic Migration**: Schema updates applied automatically on startup

## 🎮 **Multi-Tenant Usage Guide**

### **Club Admin Workflow** 👨‍💼

1. **Register Club** 🏢
   - Visit application → "Admin Login" → "Register Your Cricket Club"
   - Enter club name and admin name
   - **Save generated credentials** (username/password shown once)

2. **Manage Players** 👥
   - Add players → System auto-generates login credentials
   - Reset player passwords when needed
   - View comprehensive player statistics

3. **Organize Matches** 🏏
   - Create matches with dynamic team selection
   - Track live scores and wickets
   - Record match results and statistics

4. **Analyze Performance** 📊
   - View club-wide statistics and trends
   - Track player performance over time
   - Generate match reports and history

### **Player Workflow** 🏏

1. **Get Credentials** 🔑
   - Receive login credentials from club admin
   - Username auto-generated from name (e.g., "john.doe")

2. **Customize Profile** 👤
   - Login → Profile dropdown → "Edit Profile"
   - Set date of birth and country
   - View calculated age and career stats

3. **Track Performance** 📈
   - View personal match history
   - Analyze batting and bowling statistics
   - Monitor career progression

4. **Stay Updated** 🔄
   - Real-time match updates
   - Performance notifications
   - Club announcements

## 🔧 **Troubleshooting Guide**

### **Database Issues** 🗄️
```bash
# Check database connection
curl http://localhost:5000/api/health

# Reinitialize database schema
cd backend && npm run init-db

# Common fixes:
# - Verify SUPABASE_DB_URL in backend/.env
# - Check Supabase project is active
# - Ensure database URL includes password
```

### **Authentication Issues** 🔐
```bash
# Clear browser storage and cookies
# Check JWT_SECRET is set in backend/.env
# Verify API_URL in frontend/.env matches backend

# Test authentication:
curl -X POST http://localhost:5000/api/auth/register-club \
  -H "Content-Type: application/json" \
  -d '{"clubName": "Test Club", "adminName": "Test Admin"}'
```

### **Development Issues** 💻
```bash
# Port conflicts
# Frontend: Change port in vite.config.ts
# Backend: Change PORT in .env

# Module not found errors
rm -rf node_modules package-lock.json
npm install

# CORS issues
# Check VITE_API_URL matches backend URL
# Verify backend CORS configuration
```

### **Common Solutions** ✅
- **404 Errors**: Check API endpoints and authentication
- **Blank Pages**: Verify environment variables are set
- **Login Failures**: Ensure database is initialized
- **Permission Errors**: Check JWT token and role-based access

## 🎉 **Complete Feature Set**

### **Multi-Tenant Core** 🏢
- ✅ **Club Registration System** - Self-service onboarding
- ✅ **Data Isolation** - Complete separation between clubs  
- ✅ **Admin Authentication** - Secure club admin access
- ✅ **Player Authentication** - Individual player accounts
- ✅ **Role-Based Access** - Admin vs Player permissions
- ✅ **Password Management** - Reset functionality for both roles

### **Player Management** 👥
- ✅ **Auto-Generated Credentials** - Seamless player onboarding
- ✅ **Self-Service Profiles** - Players edit their own info
- ✅ **Profile Customization** - DOB, country, personal details
- ✅ **Age Calculation** - Automatic age computation from DOB
- ✅ **Player Statistics** - Comprehensive performance tracking

### **Match Management** 🏏
- ✅ **Dynamic Team Creation** - Flexible team formation
- ✅ **Live Match Tracking** - Real-time score updates
- ✅ **Toss & Innings Management** - Complete match flow
- ✅ **Automatic Winner Detection** - Smart result calculation
- ✅ **Man of the Match** - Performance-based selection
- ✅ **Match History** - Complete historical records

### **Analytics & Statistics** 📊
- ✅ **Player Performance Metrics** - Batting/bowling averages
- ✅ **Career Statistics** - Long-term performance tracking
- ✅ **Match Analytics** - Detailed match breakdowns
- ✅ **Boundary Analysis** - Ones, twos, threes, fours, sixes
- ✅ **Win/Loss Records** - Team and individual performance
- ✅ **Historical Trends** - Performance over time

### **User Experience** 🎨
- ✅ **Responsive Design** - Mobile-first, works everywhere
- ✅ **Intuitive Navigation** - Role-based menus and dashboards
- ✅ **Real-Time Updates** - Instant data synchronization
- ✅ **Professional UI** - Modern, clean interface
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Loading States** - Smooth user experience

### **Technical Excellence** 🔧
- ✅ **TypeScript** - End-to-end type safety
- ✅ **JWT Security** - Stateless authentication
- ✅ **Database Migrations** - Automatic schema updates
- ✅ **API Documentation** - Well-documented endpoints
- ✅ **Environment Configuration** - Flexible deployment
- ✅ **Hot Reload** - Efficient development workflow

## 🚀 **Deployment Ready**

This application is **production-ready** with:
- Environment-based configuration
- Secure authentication system
- Scalable multi-tenant architecture
- Comprehensive error handling
- Mobile-responsive design
- Database migration system

## 📈 **Future Enhancements**

Potential additions for further development:
- **Tournament Management** - Multi-team tournaments
- **Live Streaming Integration** - Real-time match broadcasting
- **Mobile App** - Native iOS/Android applications
- **Advanced Analytics** - ML-powered insights
- **Social Features** - Player interactions and messaging
- **Payment Integration** - Subscription management for clubs

## 🤝 **Contributing**

This project demonstrates modern full-stack development with AI assistance. Feel free to:
- Fork the repository
- Submit pull requests
- Report issues
- Suggest enhancements

## 📄 **License**

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ using AI-augmented development**  
*Showcasing the power of human creativity + AI assistance*
