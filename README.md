# ✨ Cosmica — Vedic Astrology Platform

A full-stack Vedic astrology platform combining Swiss Ephemeris accuracy,
MongoDB persistence, ChromaDB knowledge base, and GPT-4 AI predictions.

---

## 📁 Project Structure

```
cosmica/
├── backend/
│   ├── app/
│   │   ├── api/            → auth.py, kundli.py, predictions.py, chat.py, admin.py
│   │   ├── astrology/      → engine.py  (Nakshatra, Rashi, Lagna, Planets)
│   │   ├── core/           → config.py, database.py, security.py
│   │   ├── knowledge/      → ingestion.py  (PDF → ChromaDB pipeline)
│   │   ├── models/         → user.py, kundli.py
│   │   └── services/       → prediction.py  (RAG + OpenAI)
│   ├── main.py             → FastAPI entry point
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/          → Landing, Login, Signup, Dashboard, Chart, Admin, NotFound
│   │   ├── components/     → Navbar, BirthForm, KundliChart, CosmicSummary,
│   │   │                       PlanetTable, PredictionCard, ChatBot
│   │   ├── context/        → AuthContext.js
│   │   └── services/       → api.js
│   ├── public/index.html
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env
└── README.md
```

---

## 🚀 OPTION A: Run Without Docker (Recommended for Development)

### Prerequisites
Install these first:
- [Node.js 18+](https://nodejs.org)
- [Python 3.11+](https://python.org)
- [MongoDB Community](https://www.mongodb.com/try/download/community)

---

### Step 1: Clone / Download the Project

```bash
# If using git:
git clone https://github.com/yourname/cosmica.git
cd cosmica

# Or just unzip the folder and open a terminal inside it
```

---

### Step 2: Set Up the Backend

```bash
# Go into the backend folder
cd backend

# Create a virtual environment (keeps packages isolated)
python -m venv venv

# Activate it:
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install all Python packages
pip install -r requirements.txt
```

---

### Step 3: Configure Environment Variables

```bash
# Still inside backend/
# Edit the .env file:
nano .env    # or open it in VS Code
```

Set these values:
```
MONGODB_URL=mongodb://localhost:27017/cosmica
SECRET_KEY=any-random-string-here-make-it-long
OPENAI_API_KEY=sk-your-real-openai-key-here
```

---

### Step 4: Start MongoDB

```bash
# Mac (with Homebrew):
brew services start mongodb-community

# Windows: Open Services → Start "MongoDB"

# Or run directly:
mongod --dbpath /data/db
```

---

### Step 5: Start the Backend

```bash
# Inside backend/ with venv activated:
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO: Uvicorn running on http://127.0.0.1:8000
INFO: Application startup complete.
```

✅ Visit http://localhost:8000/docs to see the interactive API documentation.

---

### Step 6: Set Up the Frontend

Open a **new terminal window**:

```bash
# Go into frontend folder
cd frontend

# Install Node packages
npm install

# Start React dev server
npm start
```

✅ Your browser will open http://localhost:3000 — Cosmica is running!

---

## 🐳 OPTION B: Run With Docker (One Command)

Make sure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed.

```bash
# From the cosmica/ root folder:

# 1. Add your OpenAI key to .env
echo "OPENAI_API_KEY=sk-your-key-here" >> .env

# 2. Build and run everything
docker-compose up --build

# 3. Open in browser:
#    Frontend: http://localhost:3000
#    API Docs: http://localhost:8000/docs
```

To stop:
```bash
docker-compose down
```

---

## 🔑 First Time Setup After Launch

### 1. Create Your Admin Account

1. Go to http://localhost:3000/signup
2. Create your account
3. Manually set yourself as admin in MongoDB:

```bash
# Open MongoDB shell:
mongosh

# Switch to cosmica database:
use cosmica

# Set your account as admin (replace the email):
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

### 2. Upload Your First Astrology Book

1. Go to http://localhost:3000/admin
2. Click "Upload Book"
3. Select a PDF or TXT astrology book
4. Choose a category (Nakshatra, Rashi, Remedies, etc.)
5. Click Upload — the system processes and stores it in ChromaDB

### 3. Generate Your First Kundli

1. Go to http://localhost:3000/dashboard
2. Enter your birth details (name, date, time, city)
3. Click "Calculate My Kundli"
4. Your complete chart appears with:
   - North Indian Kundli chart (canvas-drawn)
   - Nakshatra, Rashi, Lagna summary
   - All 9 planetary positions with retrograde status
   - AI-powered predictions (click any prediction type)
5. Ask questions in the 🔮 chatbot (bottom right)

---

## 🌐 Deploying to the Internet (Free)

### Deploy Backend → Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# From backend/ folder:
railway init
railway up

# Add environment variables in Railway dashboard:
# MONGODB_URL, SECRET_KEY, OPENAI_API_KEY
```

### Deploy Frontend → Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# From frontend/ folder:
npm run build
vercel --prod

# Set REACT_APP_API_URL to your Railway backend URL
```

### Deploy MongoDB → MongoDB Atlas (Free Tier)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create free cluster
3. Get connection string
4. Replace MONGODB_URL in your backend environment

---

## 🔌 API Endpoints Reference

| Method | Endpoint                        | Description                    | Auth |
|--------|---------------------------------|--------------------------------|------|
| POST   | /api/auth/signup                | Create account                 | ❌   |
| POST   | /api/auth/login                 | Login, get JWT token           | ❌   |
| GET    | /api/auth/me                    | Get current user               | ✅   |
| POST   | /api/kundli/generate            | Generate Kundli from birth data| ✅   |
| GET    | /api/kundli/my-charts           | List all saved charts          | ✅   |
| GET    | /api/kundli/{id}                | Get specific chart             | ✅   |
| DELETE | /api/kundli/{id}                | Delete chart                   | ✅   |
| POST   | /api/predictions/generate       | Generate AI prediction         | ✅   |
| GET    | /api/predictions/history        | Past predictions               | ✅   |
| POST   | /api/chat/ask                   | Ask astrology chatbot          | ✅   |
| POST   | /api/admin/upload-knowledge     | Upload PDF/TXT book            | ✅   |
| POST   | /api/admin/add-rule             | Add custom rule                | ✅   |
| GET    | /api/admin/knowledge-sources    | List uploaded sources          | ✅   |
| DELETE | /api/admin/knowledge-source/{n} | Delete knowledge source        | ✅   |
| GET    | /api/admin/search-knowledge     | Semantic search knowledge base | ✅   |

Full interactive docs always at: **http://localhost:8000/docs**

---

## 🧠 How the AI Prediction Works

```
User enters birth details
        ↓
Swiss Ephemeris calculates planetary positions (Lahiri Ayanamsa)
        ↓
Nakshatra, Rashi, Lagna determined
        ↓
ChromaDB searched for relevant classical text passages
(matches your uploaded books to the chart's Nakshatra/Rashi/Lagna)
        ↓
Chart data + classical passages sent to GPT-4
        ↓
GPT-4 generates personalized Vedic prediction
        ↓
Displayed in dashboard with full formatting
```

**No OpenAI key?** The system falls back to detailed rule-based predictions
using built-in Nakshatra and Rashi interpretations automatically.

---

## 🛠️ Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| `pip install` fails on pyswisseph | Install build tools: `apt-get install gcc g++` or `xcode-select --install` on Mac |
| MongoDB connection refused | Make sure MongoDB is running: `brew services start mongodb-community` |
| `Module not found` in Python | Make sure your venv is activated: `source venv/bin/activate` |
| Frontend can't reach backend | Check that backend is on port 8000 and frontend proxy in package.json is set |
| Location not found | Try a more specific city name, e.g. "Mumbai" instead of "Bombay" |
| PDF upload fails | Make sure the PDF has extractable text (not a scanned image PDF) |

---

## 📦 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React.js 18 | Component-based UI |
| Styling | Pure CSS Variables | No build tool needed |
| Routing | React Router v6 | Client-side navigation |
| HTTP Client | Axios | API calls with interceptors |
| Backend | FastAPI (Python) | Fast async API |
| Auth | JWT + bcrypt | Secure stateless auth |
| Astrology | pyswisseph | Swiss Ephemeris — most accurate |
| Database | MongoDB + Motor | Async document storage |
| Vector DB | ChromaDB | Semantic knowledge search |
| Embeddings | sentence-transformers | Local embeddings (no API cost) |
| AI | OpenAI GPT-4o-mini | Natural language predictions |
| Geocoding | geopy + Nominatim | Free location → coordinates |
| Container | Docker + Nginx | Production deployment |

---

## ✨ Features Summary

- ✅ User signup / login with JWT authentication
- ✅ Birth chart generation using Swiss Ephemeris (Lahiri Ayanamsa)
- ✅ All 9 Vedic planets: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
- ✅ Nakshatra with pada, ruler, deity, and quality
- ✅ Rashi (Moon sign), Sun sign, Lagna (Ascendant)
- ✅ North Indian Kundli chart (canvas-drawn)
- ✅ House positions for all planets
- ✅ Save and manage multiple charts
- ✅ AI predictions (general, daily, weekly, monthly)
- ✅ Rule-based fallback (works without OpenAI)
- ✅ Astrology chatbot with chart context
- ✅ Admin: Upload PDF books → ChromaDB
- ✅ Admin: Add custom rules and interpretations
- ✅ Admin: Semantic search across knowledge base
- ✅ Docker support for easy deployment
- ✅ Responsive design

---

Built with ✨ and Jyotish Shastra
