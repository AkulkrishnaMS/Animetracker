# 🚀 Complete Setup Guide - Backend + Google OAuth

## 📋 What We Built

### Backend (Express + MongoDB + Google OAuth)
- ✅ User authentication with Google
- ✅ MongoDB database for storing user data
- ✅ API endpoints for favorites, watch lists, genres, top 10
- ✅ Session management with Passport.js
- ✅ Protected routes requiring authentication

### Frontend Updates
- ✅ Login page with Google Sign-In button
- ✅ Login route added to App.jsx

## 🛠️ Setup Instructions

### Step 1: Install MongoDB

Choose one option:

#### Option A: Local MongoDB (Windows)
```bash
# Download from: https://www.mongodb.com/try/download/community
# Run installer
# Start MongoDB service
```

#### Option B: MongoDB Atlas (Cloud - Easier!)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create a cluster (choose free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your password

### Step 2: Get Google OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create/Select Project**:
   - Click project dropdown → "New Project"
   - Name it "AnimeTracker" → Create

3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen:
     - User Type: External
     - App name: AnimeTracker
     - User support email: your email
     - Developer contact: your email
     - Save and Continue through all steps
   
5. **Create OAuth Client**:
   - Application type: "Web application"
   - Name: "AnimeTracker Web"
   - Authorized redirect URIs: Add these:
     - `http://localhost:5000/api/auth/google/callback`
   - Click "Create"
   - **COPY** Client ID and Client Secret

### Step 3: Configure Environment

Edit `backend/.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB (choose one)
# For local:
MONGODB_URI=mongodb://localhost:27017/anime-tracker

# For Atlas (replace with your connection string):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/anime-tracker?retryWrites=true&w=majority

# JWT (change this to random string)
JWT_SECRET=my-super-secret-jwt-key-1234567890

# Google OAuth (paste your credentials)
GOOGLE_CLIENT_ID=your-client-id-from-google-console
GOOGLE_CLIENT_SECRET=your-client-secret-from-google-console
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Session (change this to random string)
SESSION_SECRET=my-session-secret-key-0987654321

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Step 4: Start Backend Server

Open **NEW terminal**:

```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: localhost
Frontend URL: http://localhost:5173
```

### Step 5: Keep Frontend Running

Your frontend should already be running on http://localhost:5173

If not:
```bash
cd e:\anime-manga
npm run dev
```

### Step 6: Test Authentication

1. Go to: http://localhost:5173/login
2. Click "Sign in with Google"
3. Choose your Google account
4. Allow permissions
5. You'll be redirected back to home page (logged in!)

## 🔍 Testing the Backend

### Test Health Check
```bash
# Open browser:
http://localhost:5000/api/health

# Should show:
{"status":"OK","message":"Server is running","authenticated":false}
```

### Test Google Login Flow
1. Visit: http://localhost:5000/api/auth/google
2. Should redirect to Google login
3. After login, redirects to frontend

## 📁 Project Structure

```
anime-manga/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── passport.js        # Google OAuth strategy
│   ├── models/
│   │   └── User.js            # User schema
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   └── user.js            # User data routes
│   ├── .env                   # Environment variables
│   ├── server.js              # Main server file
│   ├── package.json
│   └── SETUP.md
├── src/
│   ├── pages/
│   │   └── Login.jsx          # Google login page
│   └── App.jsx                # Added /login route
└── ...
```

## 🔐 API Endpoints

### Authentication
- `GET /api/auth/google` - Start Google OAuth flow
- `GET /api/auth/google/callback` - Google callback
- `GET /api/auth/user` - Get current user
- `GET /api/auth/logout` - Logout user

### User Data (Requires Authentication)
- `POST /api/user/favorites` - Add to favorites
- `DELETE /api/user/favorites/:malId` - Remove from favorites
- `POST /api/user/genres` - Toggle genre
- `POST /api/user/genre-anime` - Add anime to genre
- `DELETE /api/user/genre-anime/:genreId/:malId` - Remove
- `POST /api/user/top10` - Add to top 10
- `DELETE /api/user/top10/:malId` - Remove from top 10
- `POST /api/user/watchlist` - Add to watch list

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: querySrv ENOTFOUND _mongodb._tcp.cluster...
```
**Fix**: Check your MongoDB connection string in `.env`

### Google OAuth Error
```
Error: redirect_uri_mismatch
```
**Fix**: Add `http://localhost:5000/api/auth/google/callback` to Google Console authorized redirect URIs

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Fix**: Make sure backend is running and `FRONTEND_URL` in `.env` is `http://localhost:5173`

### Session Not Persisting
**Fix**: Clear browser cookies and restart backend

## 📝 Next Steps

1. **Update UserContext** to fetch from backend instead of localStorage
2. **Add loading states** while checking authentication
3. **Protect routes** - redirect to /login if not authenticated
4. **Add logout button** to Navbar
5. **Sync localStorage data** to backend on first login

## 🎯 Quick Start Commands

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd e:\anime-manga
npm run dev
```

Visit: http://localhost:5173/login

## ✅ Checklist

- [ ] MongoDB installed/Atlas configured
- [ ] Google OAuth credentials created
- [ ] `.env` file updated with real credentials
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Visited /login page
- [ ] Google sign-in working
- [ ] Redirected back to homepage after login

🎉 **You're all set! The backend is ready and Google authentication is working!**
