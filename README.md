# PipelineIQ - Monster CI/CD AI Agent

**Team Jigyasa - 2026**

## 🔗 Links

- **Live Dashboard**: [DEPLOYMENT_URL_HERE]
- **LinkedIn Demo Video**: [VIDEO_URL_HERE]
- **GitHub Repository**: https://github.com/vartika00/monster

## 📋 Overview

Autonomous DevOps Agent that detects, fixes, and verifies CI/CD pipeline failures using multi-agent AI architecture.

## 🏗️ Architecture

```
┌─────────────────┐
│  React Dashboard│
│   (Frontend)    │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   FastAPI       │
│   (Backend)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   LangGraph     │
│  Multi-Agent    │
│   Orchestrator  │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│ Clone │ │Detect │
│ Repo  │ │Failure│
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│Analyze│ │Generate│
│Failure│ │  Fix  │
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│ Apply │ │  Run  │
│  Fix  │ │ Tests │
└───┬───┘ └───┬───┘
    │         │
    └────┬────┘
         ▼
    ┌─────────┐
    │ Commit  │
    │ Changes │
    └─────────┘
```

## ✨ Features

### Dashboard Components
1. **Input Section**
   - GitHub repository URL
   - Team name
   - Team leader name
   - Run Agent button with loading state

2. **Run Summary Card**
   - Repository details
   - Branch name: `TEAM_NAME_LEADER_NAME_AI_Fix`
   - Failures detected vs fixes applied
   - Final CI/CD status (PASSED/FAILED)
   - Total execution time

3. **Score Breakdown**
   - Base score: 100 points
   - Speed bonus: +10 (if < 5 min)
   - Efficiency penalty: -2 per commit over 20
   - Visual progress bars

4. **Fixes Applied Table**
   - File path
   - Bug type (LINTING, SYNTAX, LOGIC, TYPE_ERROR, IMPORT, INDENTATION)
   - Line number
   - Commit message with `[AI-AGENT]` prefix
   - Status (✓ Fixed / ✗ Failed)

5. **CI/CD Timeline**
   - Iteration-by-iteration view
   - Pass/fail badges
   - Retry limit tracking (e.g., 3/5)
   - Timestamps

### Backend Features
- **Multi-agent architecture** using LangGraph
- **7 specialized agents** for different tasks
- **Docker sandboxed execution** for security
- **Configurable retry limit** (default: 5)
- **results.json generation** for each run
- **Real pipeline analysis** (no fake data)

## 🚀 Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (optional, for sandboxing)
- OpenAI API key

### Setup

```bash
# 1. Clone repository
git clone https://github.com/vartika00/monster
cd "2026"

# 2. Run setup
setup.bat

# 3. Configure backend/.env
OPENAI_API_KEY=your_key_here
JWT_SECRET_KEY=your_secret_here
MAX_RETRY_LIMIT=5
DOCKER_SANDBOX_ENABLED=false

# 4. Install dependencies
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

cd ../frontend
npm install

# 5. Start servers
cd ..
start.bat
```

## 📖 Usage

1. Open http://localhost:5173
2. Enter GitHub repository URL
3. Enter team name (e.g., "Team Jigyasa")
4. Enter team leader name (e.g., "Saiyam Kumar")
5. Click "Run Agent"
6. View real-time progress and results

## 🐛 Supported Bug Types

| Bug Type | Description | Example Fix |
|----------|-------------|-------------|
| LINTING | Code style issues | Remove unused imports |
| SYNTAX | Parse errors | Add missing colons |
| LOGIC | Runtime errors | Fix off-by-one errors |
| TYPE_ERROR | Type mismatches | Add type assertions |
| IMPORT | Missing imports | Add required imports |
| INDENTATION | Whitespace issues | Normalize indentation |

## 🛠️ Tech Stack

**Frontend:**
- React 19
- Vite
- Custom CSS animations

**Backend:**
- FastAPI
- LangGraph (multi-agent orchestration)
- LangChain
- OpenAI GPT-4
- Docker (sandboxing)
- Python 3.11

**Infrastructure:**
- Git/GitHub
- Docker Compose
- Environment-based configuration

## 📊 API Endpoints

### POST /api/pipeline/run
Trigger agent execution

**Request:**
```json
{
  "repo_url": "https://github.com/user/repo",
  "team_name": "Team Jigyasa",
  "leader_name": "Saiyam Kumar",
  "retry_limit": 5
}
```

**Response:**
```json
{
  "run_id": "TEAM_JIGYASA_20240219_143022",
  "status": "running",
  "message": "Pipeline execution started"
}
```

### GET /api/pipeline/results/{run_id}
Get execution results

**Response:**
```json
{
  "repoUrl": "https://github.com/user/repo",
  "teamName": "Team Jigyasa",
  "leaderName": "Saiyam Kumar",
  "branchName": "TEAM_JIGYASA_SAIYAM_KUMAR_AI_Fix",
  "status": "PASSED",
  "failuresDetected": 11,
  "fixesApplied": 10,
  "timeTaken": "4m 18s",
  "score": {
    "base": 100,
    "speedBonus": 10,
    "efficiencyPenalty": -3,
    "total": 107
  },
  "fixes": [...],
  "timeline": [...]
}
```

## ⚠️ Known Limitations

1. **Language Support**: Currently optimized for Python, JavaScript, TypeScript
2. **Test Discovery**: Requires standard test file naming (test_*.py, *.test.js)
3. **Complex Fixes**: May require multiple iterations for interdependent issues
4. **Rate Limits**: OpenAI API rate limits may affect execution speed
5. **Docker**: Sandboxing disabled by default (enable for production)

## 👥 Team Members

**Team Jigyasa**
- [Team Member 1] - Role
- [Team Member 2] - Role
- [Team Member 3] - Role

## 📄 License

MIT License - Team Jigyasa

## 🎯 2026 Compliance

✅ Multi-agent architecture (LangGraph)
✅ React dashboard with all required sections
✅ Branch naming: `TEAM_NAME_LEADER_NAME_AI_Fix`
✅ results.json generation
✅ Configurable retry limit
✅ Sandboxed execution
✅ Score calculation system
✅ Bug type classification
✅ Timeline visualization
✅ Commit message prefix: `[AI-AGENT]`

---

**Built for 2026 Hackathon**

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (optional, for sandboxing)
- GitHub OAuth App credentials
- OpenAI API key

### 0. Initial Setup (First Time Only)

```bash
# Run setup script to create .env files
setup.bat

# Edit backend/.env with your credentials
# Then check project status
python status.py
```

### 1. Setup Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:
```env
OPENAI_API_KEY=your_openai_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8000/auth/github/callback
JWT_SECRET_KEY=your_secret_key_change_in_production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://localhost:6379
MAX_RETRY_LIMIT=5
DOCKER_SANDBOX_ENABLED=true
API_HOST=0.0.0.0
API_PORT=8000
```

### 2. Setup Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```

### 3. Run Everything

**Option A: Automated (Recommended)**
```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

**Option B: Manual**

Terminal 1 (Backend):
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 4. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📋 Features

### Backend
✅ Multi-agent architecture using LangGraph
✅ Docker sandboxed code execution
✅ GitHub OAuth authentication
✅ Configurable retry limit (default: 5)
✅ Generates results.json for each run
✅ REST API endpoints
✅ Real CI/CD pipeline analysis (no fake data)
✅ JWT-based security
✅ Production-ready error handling

### Frontend
✅ Modern React UI with animations
✅ GitHub OAuth integration
✅ Real-time pipeline status
✅ Results visualization
✅ Score tracking
✅ Timeline view
✅ Responsive design

## 🏗️ Architecture

### Multi-Agent System (LangGraph)
1. **Clone Repo Agent** - Clones repository and creates fix branch
2. **Detect Failures Agent** - Runs tests and detects failures
3. **Analyze Failures Agent** - Uses LLM to analyze root causes
4. **Generate Fixes Agent** - Uses LLM to generate code fixes
5. **Apply Fixes Agent** - Applies fixes to codebase
6. **Run Tests Agent** - Validates fixes
7. **Commit Changes Agent** - Commits and pushes fixes

### Tech Stack

**Backend:**
- FastAPI
- LangGraph
- LangChain
- OpenAI GPT-4
- Docker
- Redis
- Python 3.11

**Frontend:**
- React 19
- Vite
- Custom CSS animations
- Fetch API

## 🔐 GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - Application name: PipelineIQ
   - Homepage URL: http://localhost:5173
   - Authorization callback URL: http://localhost:8000/auth/github/callback
4. Copy Client ID and Client Secret to `backend/.env`

## 📡 API Endpoints

### Authentication
- `GET /auth/github` - Get GitHub OAuth URL
- `GET /auth/github/callback?code={code}` - Handle OAuth callback

### Pipeline
- `POST /api/pipeline/run` - Trigger pipeline agent
- `GET /api/pipeline/results/{run_id}` - Get results
- `GET /api/pipeline/status/{run_id}` - Get status

## 🧪 Testing

### Test Backend
```bash
cd backend
pytest
```

### Test Frontend
```bash
cd frontend
npm test
```

### Manual Testing Flow
1. Open http://localhost:5173
2. Click "Proceed to Dashboard"
3. Click "Login with GitHub"
4. Authorize the app
5. Fill in repository details
6. Click "Run Agent"
7. View results in real-time

## 📦 Production Deployment

### Backend (Docker)
```bash
cd backend
docker-compose up -d
```

### Frontend (Build)
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting
```

### Environment Variables (Production)
- Use HTTPS URLs
- Set strong JWT_SECRET_KEY
- Configure proper CORS origins
- Use production database
- Enable rate limiting
- Add monitoring

## 🐛 Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.11+)
- Verify .env file exists with all required variables
- Check port 8000 is not in use

### Frontend won't start
- Check Node version: `node --version` (need 18+)
- Run `npm install` again
- Check port 5173 is not in use

### OAuth not working
- Verify GitHub OAuth app callback URL matches exactly
- Check GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env
- Ensure backend is running on correct port

### API calls failing
- Check VITE_API_URL in frontend/.env
- Verify backend is running
- Check browser console for CORS errors
- Ensure you're logged in (have JWT token)

## 📝 Project Structure

```
2026/
├── backend/
│   ├── agents/
│   │   └── pipeline_agent.py    # Multi-agent system
│   ├── utils/
│   │   ├── docker_sandbox.py    # Sandboxed execution
│   │   └── results_writer.py    # JSON results
│   ├── results/                 # Generated results
│   ├── main.py                  # FastAPI app
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js          # API client
│   │   ├── App.jsx             # Main app
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── start.bat                    # Windows launcher
├── start.sh                     # Linux/Mac launcher
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT License - Team Jigyasa

## 👥 Team

Team Jigyasa - 2026

## 🆘 Support

For issues and questions:
- Check troubleshooting section
- Review API docs at http://localhost:8000/docs
- Check browser console for errors
- Verify all environment variables are set

## 📌 Quick Reference

### Setup Commands
```bash
setup.bat              # Create .env files
python status.py       # Check project status
start.bat              # Run everything
```

### Manual Commands
```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### Key Files
- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration
- `backend/results/` - Pipeline results (JSON)
- `backend/agents/pipeline_agent.py` - Multi-agent system
- `frontend/src/services/api.js` - API client
