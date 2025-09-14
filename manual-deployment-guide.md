# BetBet Manual Deployment Guide for Render

Since the Blueprint is having issues, let's deploy manually. This is actually easier and more reliable.

## 🚀 Step-by-Step Manual Deployment

### Step 1: Create PostgreSQL Database
1. In Render Dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. **Name**: `betbet-postgres`
4. **Database Name**: `betbet`
5. **User**: `betbet`
6. **Region**: Choose closest to Zimbabwe
7. **Plan**: Free
8. Click **"Create Database"**
9. **Save the External Database URL** (you'll need it)

### Step 2: Create Redis Cache
1. Click **"New +"** → **"Redis"**
2. **Name**: `betbet-redis`
3. **Region**: Same as PostgreSQL
4. **Plan**: Free
5. Click **"Create Redis Instance"**
6. **Save the Redis URL** (you'll need it)

### Step 3: Deploy Frontend
1. Click **"New +"** → **"Web Service"**
2. **Connect Repository**: `TapiwanasheTrevor/betbet-final`
3. **Name**: `betbet-frontend`
4. **Region**: Same as databases
5. **Branch**: `main`
6. **Root Directory**: `frontend`
7. **Runtime**: `Node`
8. **Build Command**: `npm ci && npm run build`
9. **Start Command**: `npm start`
10. **Plan**: Free

**Environment Variables for Frontend:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[YOUR_CLERK_PUBLISHABLE_KEY]
CLERK_SECRET_KEY=[YOUR_CLERK_SECRET_KEY]
NODE_ENV=production
```

### Step 4: Deploy User Profile Service
1. Click **"New +"** → **"Web Service"**
2. **Connect Repository**: `TapiwanasheTrevor/betbet-final`
3. **Name**: `betbet-user-profile`
4. **Region**: Same as databases
5. **Branch**: `main`
6. **Root Directory**: `backend`
7. **Runtime**: `Python 3`
8. **Build Command**: `pip install -r requirements.txt`
9. **Start Command**: `cd services/user_profile && PYTHONPATH=../.. python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
10. **Plan**: Free

**Environment Variables for User Profile Service:**
```
DATABASE_URL=[YOUR_POSTGRES_URL_FROM_STEP_1]
REDIS_URL=[YOUR_REDIS_URL_FROM_STEP_2]
CLERK_SECRET_KEY=[YOUR_CLERK_SECRET_KEY]
CLERK_WEBHOOK_SECRET=whsec_d4sthV8a9e0g0648VqL84wBTZGbkhRF1
CLERK_DOMAIN=betbet.co.zw
MONGODB_URL=mongodb+srv://maposheret_db_user:g65o1GxGXBxUv0B2@betbet.ked2vja.mongodb.net/betbet?retryWrites=true&w=majority&appName=BetBet
```

## 🎯 What URLs You'll Get:
- Frontend: `https://betbet-frontend.onrender.com`
- User Profile API: `https://betbet-user-profile.onrender.com`

## ⚠️ Important Notes:
- Use the **exact same region** for all services
- **Copy the database URLs exactly** from the database service pages
- Services will take 5-10 minutes each to deploy
- Free tier services may sleep after 15 minutes of inactivity

Would you like to try this manual approach? It's much more reliable than the Blueprint method.