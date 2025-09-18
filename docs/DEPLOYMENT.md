# BetBet Platform - Deployment Guide

This guide covers deploying the BetBet platform to production using Render, with instructions for both development and live deployment.

## 🚀 Quick Deployment to Render

### Prerequisites
1. GitHub account with the BetBet repository
2. Render account (free tier available)
3. Clerk account for authentication
4. Stripe account for payments
5. MongoDB Atlas account (for production MongoDB)

### Step 1: Prepare Environment Variables

Create accounts and gather these essential API keys:

#### Clerk Authentication
1. Go to [Clerk Dashboard](https://dashboard.clerk.dev)
2. Create a new application
3. Get your keys from the API Keys section:
   - `CLERK_PUBLISHABLE_KEY`: pk_live_xxx
   - `CLERK_SECRET_KEY`: sk_live_xxx
   - `CLERK_WEBHOOK_SECRET`: whsec_xxx

#### Stripe Payments
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your keys from Developers > API Keys:
   - `STRIPE_SECRET_KEY`: sk_live_xxx
   - `STRIPE_WEBHOOK_SECRET`: whsec_xxx

#### MongoDB Atlas
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/betbet`

#### OpenAI (for Analytics)
1. Get API key from [OpenAI Platform](https://platform.openai.com)
2. `OPENAI_API_KEY`: sk-xxx

### Step 2: Deploy to Render

1. **Fork/Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd betbet-platform
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Connect your GitHub account
   - Select the BetBet repository

3. **Deploy Using Blueprint**
   - In Render, click "New +" → "Blueprint"
   - Select your repository
   - Choose `render.yaml` file
   - Click "Apply"

4. **Set Environment Variables**
   During deployment, Render will prompt for these variables:
   ```env
   CLERK_SECRET_KEY=sk_live_xxx
   CLERK_WEBHOOK_SECRET=whsec_xxx
   CLERK_DOMAIN=betbet.com
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   MONGODB_URL=mongodb+srv://...
   OPENAI_API_KEY=sk-xxx
   ```

5. **Wait for Deployment**
   - All services will deploy automatically
   - Monitor the deploy logs for any errors
   - Services will be available at:
     - Frontend: `https://betbet-frontend.onrender.com`
     - API Services: `https://betbet-[service-name].onrender.com`

### Step 3: Post-Deployment Configuration

#### Configure Clerk Webhooks
1. In Clerk Dashboard → Webhooks
2. Add endpoint: `https://betbet-user-profile.onrender.com/api/v1/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `session.created`

#### Configure Stripe Webhooks
1. In Stripe Dashboard → Webhooks
2. Add endpoint: `https://betbet-wallet.onrender.com/api/v1/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

#### Update Frontend Environment
In your frontend environment variables:
```env
NEXT_PUBLIC_API_URL=https://betbet-api.onrender.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
```

## 🛠️ Development Deployment

### Local Development with Docker

1. **Clone and Setup**
   ```bash
   git clone <repo-url>
   cd betbet-platform
   cp .env.example .env
   # Edit .env with your development keys
   ```

2. **Start Backend Services**
   ```bash
   cd backend
   docker-compose up --build
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access Services**
   - Frontend: http://localhost:3000
   - User Profile API: http://localhost:8000
   - Game Engine API: http://localhost:8001
   - Betting Market API: http://localhost:8002
   - API Gateway: http://localhost:80

### Local Development without Docker

1. **Setup Databases**
   ```bash
   # PostgreSQL
   createdb betbet

   # MongoDB
   # Install MongoDB locally or use MongoDB Atlas

   # Redis
   redis-server
   ```

2. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt

   cd ../frontend
   npm install
   ```

3. **Run Services**
   ```bash
   # Terminal 1: User Profile Service
   cd backend/services/user_profile
   uvicorn main:app --port 8000 --reload

   # Terminal 2: Game Engine Service
   cd backend/services/game_engine
   uvicorn main:app --port 8001 --reload

   # Terminal 3: Betting Market Service
   cd backend/services/betting_market
   uvicorn main:app --port 8002 --reload

   # Terminal 4: Frontend
   cd frontend
   npm run dev
   ```

## 🔧 Production Configuration

### Environment Variables for Production

```env
# Authentication
CLERK_SECRET_KEY=sk_live_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx
CLERK_DOMAIN=betbet.com

# Payments
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Databases
DATABASE_URL=postgresql://user:pass@host/betbet
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/betbet
REDIS_URL=redis://user:pass@host:port

# AI Services
OPENAI_API_KEY=sk-xxx

# Security
NODE_ENV=production
ENVIRONMENT=production
LOG_LEVEL=INFO
CORS_ORIGINS=https://betbet.com,https://www.betbet.com
```

### Database Migrations

```bash
# Run database migrations after deployment
# This is handled automatically in the Docker containers
# But for manual deployments:
cd backend
python -m alembic upgrade head
```

### SSL Certificate Setup

Render automatically provides SSL certificates, but for custom domains:

1. **Add Custom Domain**
   - In Render service settings
   - Add your domain (e.g., betbet.com)
   - Update DNS records as instructed

2. **Update Clerk Settings**
   - In Clerk Dashboard → Domains
   - Add your custom domain
   - Update frontend environment variables

## 🚨 Troubleshooting

### Common Deployment Issues

1. **Service Won't Start**
   ```bash
   # Check logs in Render dashboard
   # Common issues:
   # - Missing environment variables
   # - Database connection failures
   # - Port conflicts
   ```

2. **Database Connection Issues**
   ```bash
   # Ensure DATABASE_URL format is correct
   DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname

   # For MongoDB Atlas, ensure IP whitelist includes 0.0.0.0/0
   MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/dbname
   ```

3. **Authentication Issues**
   ```bash
   # Verify Clerk webhook endpoints are reachable
   curl -X POST https://betbet-user-profile.onrender.com/api/v1/webhooks/clerk

   # Check Clerk domain settings match your deployment URL
   ```

4. **Payment Processing Issues**
   ```bash
   # Verify Stripe webhook endpoints
   # Ensure webhook secrets match between Stripe and your app
   # Check Stripe test vs live mode settings
   ```

### Health Checks

Each service provides a health endpoint:
```bash
curl https://betbet-user-profile.onrender.com/health
curl https://betbet-game-engine.onrender.com/health
curl https://betbet-betting-market.onrender.com/health
```

### Monitoring and Logs

1. **Service Logs**
   - Available in Render dashboard
   - Real-time log streaming
   - Historical log search

2. **Database Monitoring**
   - PostgreSQL: Built-in Render metrics
   - MongoDB: MongoDB Atlas monitoring
   - Redis: Basic metrics in Render

3. **Error Tracking**
   - Consider adding Sentry for error tracking
   - Set `SENTRY_DSN` environment variable

## 📊 Scaling Considerations

### Render Scaling
- Start with Starter plans for all services
- Upgrade to Professional for production traffic
- Enable auto-scaling for high-traffic periods

### Database Scaling
- PostgreSQL: Upgrade to larger instance sizes
- MongoDB: Use MongoDB Atlas cluster scaling
- Redis: Upgrade to higher memory tiers

### CDN Setup
- Use Cloudflare for static asset delivery
- Configure caching rules for API responses
- Enable image optimization

## 🔒 Security Checklist

- [ ] SSL certificates enabled for all domains
- [ ] Environment variables secured (no secrets in code)
- [ ] Database connections use SSL
- [ ] API rate limiting configured
- [ ] CORS properly configured for production domains
- [ ] Webhook signatures verified
- [ ] User input sanitization implemented
- [ ] Regular security updates scheduled

## 📈 Performance Optimization

### Backend Optimization
- Enable Redis caching for frequently accessed data
- Use database connection pooling
- Implement proper database indexing
- Consider async task queues for heavy operations

### Frontend Optimization
- Enable Next.js Image Optimization
- Use static generation where possible
- Implement proper caching headers
- Minimize bundle sizes

## 🎯 Go-Live Checklist

### Pre-Launch
- [ ] All services deploy successfully
- [ ] Database migrations completed
- [ ] Webhooks configured and tested
- [ ] Payment processing tested (use Stripe test mode first)
- [ ] Authentication flows working
- [ ] API endpoints responding correctly
- [ ] Frontend connects to all backend services
- [ ] Real-time features (WebSocket) working

### Post-Launch
- [ ] Monitor service health and performance
- [ ] Check error rates and response times
- [ ] Verify payment processing in production
- [ ] Monitor database performance
- [ ] Set up alerting for critical issues
- [ ] Plan for user onboarding and support

## 🆘 Emergency Procedures

### Service Outage
1. Check Render service status
2. Review recent deployments
3. Check error logs in dashboard
4. Rollback to previous version if needed
5. Contact Render support if platform issue

### Database Issues
1. Check connection strings and credentials
2. Verify database server status
3. Check for connection pool exhaustion
4. Monitor query performance
5. Scale database resources if needed

### Payment Issues
1. Check Stripe dashboard for errors
2. Verify webhook endpoints are responding
3. Test payment flow in Stripe test mode
4. Contact Stripe support if needed

---

This deployment guide should get your BetBet platform running in production. For additional help, consult the main README.md or contact the development team.