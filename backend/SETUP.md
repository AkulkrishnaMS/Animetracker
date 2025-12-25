# Backend Setup Guide

## Prerequisites
1. **MongoDB** - Install MongoDB locally or use MongoDB Atlas (cloud)
2. **Google Cloud Console** - For OAuth credentials

## Step 1: Install MongoDB

### Option A: Local MongoDB
1. Download from: https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. MongoDB will run on `mongodb://localhost:27017`

### Option B: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Update `.env` file with your connection string

## Step 2: Get Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
   - Copy Client ID and Client Secret

5. Update `backend/.env` file:
```env
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
```

## Step 3: Configure Environment Variables

Edit `backend/.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection (choose one)
# Local MongoDB:
MONGODB_URI=<YOUR_LOCAL_MONGODB_URI>
# OR MongoDB Atlas (store only in .env, never commit the real string):
# MONGODB_URI=<YOUR_ATLAS_CONNECTION_STRING>

# JWT Secret (do not commit real secrets)
JWT_SECRET=<GENERATE_A_RANDOM_SECRET_AND_SET_IN_ENV>

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Session Secret (change this!)
SESSION_SECRET=your-session-secret-key-change-this

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

Server will start on: http://localhost:5000

## Step 5: Test Backend

1. Health check: http://localhost:5000/api/health
2. Should see: `{"status":"OK","message":"Server is running","authenticated":false}`

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google login
- `GET /api/auth/google/callback` - Google callback
- `GET /api/auth/user` - Get current user
- `GET /api/auth/logout` - Logout

### User Data
- `POST /api/user/favorites` - Add to favorites
- `DELETE /api/user/favorites/:malId` - Remove from favorites
- `POST /api/user/genres` - Toggle genre
- `POST /api/user/genre-anime` - Add anime to genre
- `DELETE /api/user/genre-anime/:genreId/:malId` - Remove anime from genre
- `POST /api/user/top10` - Add to top 10
- `DELETE /api/user/top10/:malId` - Remove from top 10
- `POST /api/user/watchlist` - Add to watch list

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check connection string in `.env`
- For Atlas: Check IP whitelist and credentials

### Google OAuth Error
- Verify Client ID and Secret in `.env`
- Check authorized redirect URIs in Google Console
- Make sure Google+ API is enabled

### CORS Error
- Check `FRONTEND_URL` in `.env` matches your React app URL
- Default is `http://localhost:5173`

## Next Steps

After backend is running:
1. Update frontend to use backend API
2. Add Google login button to frontend
3. Replace localStorage with API calls
4. Test authentication flow
