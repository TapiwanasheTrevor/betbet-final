# BetBet Platform - Revolutionary P2P Betting & Gaming

<div align="center">
  <h3>A comprehensive peer-to-peer betting and gaming platform built with Next.js and FastAPI microservices</h3>

  [![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Auth](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=flat)](https://clerk.dev/)
  [![Database](https://img.shields.io/badge/Database-PostgreSQL-316192?style=flat&logo=postgresql)](https://www.postgresql.org/)
  [![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat)](https://render.com/)
</div>

## 🚀 Platform Overview

BetBet is a revolutionary peer-to-peer betting and gaming platform that empowers users to both participate in and monetize various forms of competitive activities. The platform creates a comprehensive ecosystem with **zero house edge** where users bet against each other across five interconnected modules.

### 🎯 Core Modules

#### 1. **Gaming Hub** 🎮
- **Multi-game Support**: Casino games, board games, video games, turn-based strategy
- **Tournament System**: Single/double elimination, round robin, Swiss formats
- **Real-time Gaming**: WebSocket-powered live gameplay
- **Spectator Economy**: Monetizable spectating with tipping systems
- **Social Streaming**: Direct integration with social media platforms

#### 2. **Custom Betting Marketplace** 📈
- **Polymarket-style Markets**: Bet on anything from politics to weather
- **Trading Interface**: Advanced order books, charting tools, technical analysis
- **Pool Betting**: Organized group betting with shared risk/reward
- **Market Creation**: User-generated markets with creator fees
- **Real-time Trading**: Live odds updates and position management

#### 3. **Expert Analysis Suite** 🧠
- **AI-Powered Analytics**: RAG-enabled natural language queries
- **Data Integration**: Upload fixtures, browse datasets, API connections
- **Booking Code Generation**: Compatible with betting.co.zw, africabet.mobi
- **Subscription Model**: Monetizable expert picks and analysis
- **Performance Tracking**: Comprehensive statistics and leaderboards

#### 4. **Multi-Currency Wallet** 💰
- **Multiple Payment Gateways**: Bank transfers, mobile money, cards, crypto
- **Cryptocurrency Support**: Bitcoin, Ethereum, stablecoins with Lightning Network
- **P2P Transfers**: Instant user-to-user transactions
- **Security Features**: 2FA, biometric authentication, cold storage integration
- **Transaction History**: Detailed records with export capabilities

#### 5. **Social Forum** 💬
- **Discord-like Communities**: Topic-based discussion groups
- **Voice Channels**: Real-time voice chat for coordination
- **Content Monetization**: Paywall posts, tip jars, subscription tiers
- **Group Wallets**: Pooled betting resources
- **Moderation Tools**: Community-driven content management

## 🏗️ Architecture

### Frontend (Next.js 14)
```
frontend/
├── app/                    # App router pages
│   ├── page.tsx           # Dashboard
│   ├── gaming/            # Gaming hub
│   ├── betting/           # Betting markets
│   ├── analysis/          # Expert analysis
│   ├── wallet/            # Wallet management
│   └── forum/             # Social forum
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
└── lib/                   # Utilities and configs
```

### Backend (FastAPI Microservices)
```
backend/
├── services/
│   ├── user_profile/      # User management + Clerk integration
│   ├── game_engine/       # Gaming sessions + WebSocket
│   ├── betting_market/    # Markets + Trading + Order book
│   ├── analytics/         # AI analysis + Expert system
│   ├── wallet/           # Payments + Transactions
│   └── social_forum/     # Communities + Messaging
├── shared/               # Common utilities
│   ├── database.py       # Multi-database connections
│   ├── clerk_auth.py     # Authentication utilities
│   └── models.py         # Shared data models
└── docker-compose.yml    # Local development setup
```

## 🛠️ Technology Stack

### Core Technologies
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.11+, AsyncIO
- **Authentication**: Clerk (managed auth with SSO, MFA, webhooks)
- **API Gateway**: NGINX (development), Kong (production)

### Databases & Storage
- **PostgreSQL**: Primary relational data, user profiles, transactions
- **MongoDB**: Game states, logs, analysis data
- **Redis**: Caching, sessions, real-time data, pub/sub
- **Cassandra**: Chat messages, high-write scenarios (optional)

### Real-time & Communication
- **WebSockets**: FastAPI WebSocket for gaming and chat
- **Redis Pub/Sub**: Inter-service communication
- **Kafka**: Event streaming (production)

### Payments & Integration
- **Stripe**: Card payments, subscriptions, Connect for payouts
- **Crypto**: Multi-wallet support, Lightning Network
- **Mobile Money**: EcoCash, OneMoney integration
- **APIs**: Sports data, market oracles, social media

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Deployment**: Render (primary), Railway (alternative)
- **Monitoring**: Prometheus, Grafana (optional)
- **CDN**: Cloudflare for static assets

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+
- Docker and Docker Compose
- PostgreSQL, MongoDB, Redis (or use Docker)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd betbet-platform

# Setup environment variables
cp .env.example .env
# Edit .env with your Clerk, Stripe, and other API keys
```

### 2. Frontend Development
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

### 3. Backend Development

#### Option A: Docker Compose (Recommended)
```bash
cd backend
docker-compose up --build
# All services available on ports 8000-8005
# Databases on standard ports
```

#### Option B: Local Development
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start databases (if not using Docker)
# PostgreSQL, MongoDB, Redis must be running

# Run individual services
cd services/user_profile && uvicorn main:app --port 8000 --reload
cd services/game_engine && uvicorn main:app --port 8001 --reload
cd services/betting_market && uvicorn main:app --port 8002 --reload
# ... etc for other services
```

### 4. Database Setup
```bash
# Create database tables
python -m alembic upgrade head

# Seed initial data (games, categories, etc.)
python scripts/seed_data.py
```

## 🌐 Deployment

### Deploy to Render
1. **Push to GitHub**: Ensure code is in a GitHub repository
2. **Connect to Render**: Link your GitHub repo to Render
3. **Environment Variables**: Set up Clerk, Stripe, and other API keys
4. **Deploy**: Use the provided `render.yaml` for automatic deployment

```bash
# The render.yaml file configures:
# - PostgreSQL and Redis databases
# - All 6 microservices
# - Frontend Next.js app
# - Environment variable management
```

### Environment Variables Required
```env
# Clerk Authentication
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI (for analytics)
OPENAI_API_KEY=sk-...

# External Services
MONGODB_URL=mongodb+srv://...  # Use MongoDB Atlas for production
```

## 📊 Monetization Strategy

### Platform Revenue (1-3% of volume)
- Transaction fees on peer-to-peer bets
- Premium subscription tiers
- Market creation fees for high-volume markets
- Featured content placement
- Data API access licensing

### User Revenue Opportunities
- **Game Hosting**: Earn percentage of entry fees
- **Market Creation**: Earn creator fees on trading volume
- **Expert Analysis**: Subscription and tip-based income
- **Content Creation**: Paywall posts, premium groups
- **Liquidity Provision**: Earn spreads on market making
- **Referral Program**: Earn commissions on referred users
- **Tournament Organization**: Host paid tournaments
- **Spectator Services**: Charge for premium spectating

## 🔒 Security & Compliance

### Security Features
- **Authentication**: Clerk-managed with SSO, MFA, session management
- **Authorization**: Role-based access control, KYC levels
- **Data Protection**: End-to-end encryption, secure APIs
- **Payment Security**: PCI DSS compliance via Stripe
- **Rate Limiting**: API protection, DDoS mitigation

### Compliance
- **KYC/AML**: Tiered verification system
- **Age Verification**: Required for platform access
- **Responsible Gambling**: Self-exclusion, limits, monitoring
- **Data Privacy**: GDPR compliant data handling
- **Geographic Restrictions**: Configurable by jurisdiction

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript/Python best practices
- Write tests for new features
- Update documentation for API changes
- Ensure Docker builds work correctly
- Test across different browsers and devices

## 📜 API Documentation

Once deployed, access interactive API documentation:
- **User Profile**: `https://your-domain.com/api/v1/users/docs`
- **Game Engine**: `https://your-domain.com/api/v1/games/docs`
- **Betting Markets**: `https://your-domain.com/api/v1/markets/docs`
- **Analytics**: `https://your-domain.com/api/v1/analysis/docs`
- **Wallet**: `https://your-domain.com/api/v1/wallets/docs`
- **Social Forum**: `https://your-domain.com/api/v1/communities/docs`

## 🎯 Roadmap

### Phase 1: Core Platform (Current)
- ✅ User authentication and profiles
- ✅ Basic gaming sessions
- ✅ Simple betting markets
- ✅ Wallet functionality
- ✅ Social forum basics

### Phase 2: Advanced Features
- [ ] AI-powered analytics
- [ ] Advanced trading tools
- [ ] Mobile app (React Native)
- [ ] Tournament system
- [ ] Expert subscriptions

### Phase 3: Scale & Optimize
- [ ] Kafka event streaming
- [ ] Advanced caching strategies
- [ ] Mobile money integration
- [ ] Regulatory compliance tools
- [ ] Multi-language support

### Phase 4: Ecosystem Expansion
- [ ] Third-party game integrations
- [ ] API marketplace
- [ ] White-label solutions
- [ ] International expansion
- [ ] DeFi integrations

## 📞 Support

- **Documentation**: [docs.betbet.com](https://docs.betbet.com)
- **Community**: [Discord Server](https://discord.gg/betbet)
- **Issues**: [GitHub Issues](https://github.com/betbet/platform/issues)
- **Email**: support@betbet.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p><strong>Built with ❤️ by the BetBet Team</strong></p>
  <p>Empowering users to bet, play, and earn in a peer-to-peer ecosystem</p>
</div>