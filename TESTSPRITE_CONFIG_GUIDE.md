# TestSprite Configuration Guide

## 🎯 How to Configure TestSprite for Proper Testing

### Step 1: Get a Valid JWT Token

**Option A: Register a test user and get token**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test123!@#",
    "username": "testsprite_user"
  }'
```

This will return a JWT token like:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Option B: Login with existing user**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "yourpassword"
  }'
```

### Step 2: Configure TestSprite with Correct Endpoints

Instead of testing root URL, test specific endpoints:

#### Authentication Endpoints
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user
- **GET** `/api/auth/google` - Google OAuth

#### User Endpoints (Require Authentication)
- **POST** `/api/user/favorites` - Add to favorites
- **DELETE** `/api/user/favorites/:malId` - Remove from favorites
- **POST** `/api/user/genres` - Toggle favorite genre
- **POST** `/api/user/genre-anime` - Add anime to genre list
- **POST** `/api/user/top10` - Add to top 10 list
- **PUT** `/api/user/preferences` - Update preferences
- **GET** `/api/user/profile/:userId` - Get user profile
- **POST** `/api/user/watchlist` - Add to watchlist

### Step 3: Example Test Configuration

#### Test: Add to Favorites (Authenticated)
```json
{
  "endpoint": "https://your-ngrok-url.ngrok-free.app/api/user/favorites",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer YOUR_ACTUAL_JWT_TOKEN_HERE",
    "Content-Type": "application/json"
  },
  "body": {
    "mal_id": 1,
    "title": "Cowboy Bebop",
    "type": "TV",
    "images": {
      "jpg": {
        "image_url": "https://cdn.myanimelist.net/images/anime/4/19644.jpg"
      }
    },
    "score": 8.9
  },
  "expectedStatus": 200
}
```

#### Test: Login (No Auth Required)
```json
{
  "endpoint": "https://your-ngrok-url.ngrok-free.app/api/auth/login",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "email": "testuser@example.com",
    "password": "Test123!@#"
  },
  "expectedStatus": 200
}
```

#### Test: Unauthorized Access
```json
{
  "endpoint": "https://your-ngrok-url.ngrok-free.app/api/user/favorites",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {},
  "expectedStatus": 401
}
```

### Step 4: Run Tests Against Your ngrok URL

Your current ngrok URL: `https://semiurban-unvociferously-keith.ngrok-free.dev`

Make sure:
1. Backend server is running (`cd backend && npm start`)
2. ngrok is running and pointing to port 5000
3. Use the full endpoint path (not just root URL)

### Step 5: Expected Results After Fixes

With proper authentication and endpoints, you should see:

✅ **POST to /api/user/favorites** (with valid token) → 200
✅ **POST to /api/auth/login** (valid credentials) → 200  
✅ **POST to /api/user/favorites** (no token) → 401
✅ **POST to /api/invalid-endpoint** → 404 (JSON response)
✅ **POST with empty body to required fields** → 400 (JSON error message)

---

## 🔧 Quick Test Script

Save this as `test-api.sh` or run commands individually:

```bash
# 1. Register a test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!@#","username":"testuser"}' \
  | jq .

# 2. Login and get token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!@#"}' \
  | jq -r .token)

echo "Token: $TOKEN"

# 3. Test authenticated endpoint
curl -X POST http://localhost:5000/api/user/favorites \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mal_id":1,"title":"Test Anime","type":"TV"}' \
  | jq .

# 4. Test unauthorized access (should return 401 JSON)
curl -X POST http://localhost:5000/api/user/favorites \
  -H "Content-Type: application/json" \
  -d '{"mal_id":1}' \
  | jq .

# 5. Test invalid endpoint (should return 404 JSON)
curl -X GET http://localhost:5000/api/invalid \
  | jq .
```

---

## 📊 What TestSprite Should See

After implementing these changes, re-running tests should show:
- **Better pass rate** (8-9/10 instead of 5/10)
- **JSON error responses** (no more HTML parsing errors)
- **Proper 401 errors** for unauthenticated requests
- **Proper 404 errors** for invalid endpoints
- **Proper 400 errors** for validation failures

The remaining "failures" will actually be your API working correctly! 🎉
