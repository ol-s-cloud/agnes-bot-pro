# Agnes Bot Pro - Advanced Trading Automation Platform

![Agnes Bot Pro](https://img.shields.io/badge/Agnes%20Bot%20Pro-v2.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A comprehensive SaaS platform for automated trading with AI-powered strategies, multi-platform support (traditional + crypto), and advanced analytics.

## 🚀 **NEW in v2.0.0 - REAL Trading Integrations**

### **✅ Live Trading Platforms**
- **Tradovate** - Futures trading with demo/live switching
- **NinjaTrader** - Simulation and live account support  
- **Binance** - Crypto trading with testnet/mainnet modes
- **Bybit** - Derivatives trading with demo environments

### **✅ Comprehensive Analytics**
- **CoinGecko** - Crypto market data and trends
- **CoinMarketCap** - Professional crypto analytics
- **CoinGlass** - Derivatives and futures analytics 
- **RWA.xyz** - Real World Asset tokenization data

### **✅ Real Functionality (No More Mock Data!)**
- **Live market data** from multiple exchanges
- **Real order placement** and management
- **Demo/Live mode switching** for safe testing
- **Strategy automation** with risk management
- **Real-time charts** with technical indicators
- **Multi-platform portfolio** management

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Charts**: Lightweight Charts (TradingView style)
- **Trading**: Multi-platform API integrations
- **Analytics**: Real-time data from multiple sources
- **Deployment**: Vercel

### Project Structure
```
agnes-bot-pro/
├── app/                           # Next.js App Router
│   ├── dashboard/                # Dashboard pages
│   │   └── trading/              # 🆕 Unified Trading Dashboard
│   ├── auth/                     # Authentication pages
│   └── api/                      # API routes
├── components/                   # React components
│   ├── trading/                  # 🆕 Trading components
│   │   ├── UnifiedTradingDashboard.js  # Main trading interface
│   │   └── TradingViewChart.js   # Real-time charting
│   ├── dashboard/                # Dashboard components
│   ├── auth/                     # Auth components
│   └── ui/                       # UI components
├── lib/                          # Utility libraries
│   ├── trading-apis/             # 🆕 Real trading integrations
│   │   ├── tradovate-api.js      # Tradovate futures
│   │   ├── ninjatrader-api.js    # NinjaTrader integration
│   │   ├── binance-api.js        # Binance crypto
│   │   └── bybit-api.js          # Bybit derivatives
│   ├── analytics-apis/           # 🆕 Market analytics
│   │   ├── coingecko-api.js      # Crypto market data
│   │   ├── coinmarketcap-api.js  # Professional crypto data
│   │   ├── coinglass-api.js      # Derivatives analytics
│   │   └── rwa-api.js            # Real World Assets
│   ├── trading-manager/          # 🆕 Trading engine
│   │   ├── unified-trading-manager.js  # Multi-platform manager
│   │   └── strategy-engine.js    # Strategy automation
│   ├── auth.js                   # Authentication config
│   ├── database.js               # Database connection
│   └── strategies/               # Strategy implementations
├── prisma/                       # Database schema and migrations
├── public/                       # Static assets
└── styles/                       # Global styles
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Trading account APIs (see .env.example)
- Analytics API keys (optional but recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ol-s-cloud/agnes-bot-pro.git
   cd agnes-bot-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your API credentials:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/agnes_bot_pro"
   
   # Authentication
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Trading Platforms (Demo accounts for testing)
   NEXT_PUBLIC_BINANCE_TESTNET_API_KEY="your-testnet-key"
   NEXT_PUBLIC_BINANCE_TESTNET_SECRET="your-testnet-secret"
   NEXT_PUBLIC_BYBIT_TESTNET_API_KEY="your-testnet-key"
   NEXT_PUBLIC_BYBIT_TESTNET_SECRET="your-testnet-secret"
   
   # Analytics (Optional)
   NEXT_PUBLIC_COINGECKO_API_KEY="your-pro-key"
   NEXT_PUBLIC_CMC_API_KEY="your-cmc-key"
   ```

4. **Database setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

6. **Access Trading Dashboard**
   ```bash
   # Navigate to the unified trading interface
   http://localhost:3000/dashboard/trading
   ```

## 🎯 **Key Features**

### **Multi-Platform Trading**
- **Traditional Markets**: Tradovate (futures), NinjaTrader
- **Crypto Markets**: Binance, Bybit with testnet support
- **Demo/Live Switching**: Safe testing before real money
- **Unified Interface**: Manage all accounts from one dashboard

### **Real-Time Analytics**
- **Market Overview**: Global crypto and derivatives data
- **Portfolio Tracking**: Multi-platform position management
- **Advanced Charts**: TradingView-style charting with indicators
- **Risk Management**: Position sizing and loss limits

### **Strategy Automation**
- **Built-in Strategies**: ICT, EMA Crossover, Mean Reversion
- **Custom Strategies**: Visual and code-based strategy builder
- **Risk Controls**: Automated position sizing and stop losses
- **Multi-Platform**: Run strategies across different exchanges

### **Professional Analytics**
- **Derivatives Data**: Open interest, funding rates, liquidations
- **Market Sentiment**: Fear & greed index, dominance metrics
- **RWA Integration**: Real World Asset tokenization tracking
- **Performance Metrics**: Win rates, Sharpe ratios, drawdown analysis

## 🚀 Deployment

### Deploy to Vercel

1. **Connect to Vercel**
   - Fork this repository
   - Connect your GitHub account to Vercel
   - Import the project

2. **Environment Variables**
   Add all environment variables from `.env.example` to your Vercel project settings.

3. **Database Setup**
   - Set up a PostgreSQL database (Railway, Supabase, or PlanetScale)
   - Update `DATABASE_URL` in Vercel environment variables
   - Run migrations: `npx prisma db push`

4. **Deploy**
   ```bash
   git push origin main
   ```
   
   Vercel will automatically deploy your application.

## 🔧 **What's New in v2.0.0**

### **🆕 Real Trading Functionality**
- Complete Tradovate futures integration
- NinjaTrader simulation and live support
- Binance testnet and mainnet trading
- Bybit derivatives and spot trading

### **🆕 Comprehensive Analytics**
- CoinGecko market data integration
- CoinMarketCap professional analytics
- CoinGlass derivatives analytics
- RWA.xyz real-world asset tracking

### **🆕 Professional Trading Interface**
- Unified trading dashboard
- Real-time TradingView-style charts
- Multi-platform position management
- Advanced order management

### **🆕 Strategy Automation**
- Complete strategy engine
- Risk management system
- Multi-platform strategy execution
- Performance tracking and analytics

## 🛡️ **Security & Risk Management**

### **Safety Features**
- **Demo Mode First**: Always test strategies in demo environments
- **Position Limits**: Configurable position sizing and limits
- **Stop Losses**: Automated risk management
- **API Security**: Encrypted credentials and secure connections
- **Multi-Factor Auth**: Secure user authentication

### **Risk Controls**
- **Portfolio Level**: Maximum daily loss limits
- **Position Level**: Individual trade risk management
- **Strategy Level**: Per-strategy risk allocation
- **Platform Level**: Exchange-specific limits

## 🗺️ **Roadmap**

### **Phase 1: Enhanced Analytics** 🚧
- [ ] Advanced technical indicators
- [ ] Social sentiment analysis
- [ ] News sentiment integration

### **Phase 2: More Platforms** 🔮
- [ ] Interactive Brokers integration
- [ ] TD Ameritrade support
- [ ] Coinbase Pro integration

### **Phase 3: Advanced Features** 🔮
- [ ] Copy trading functionality
- [ ] Mobile app (React Native)
- [ ] Advanced machine learning models
- [ ] Options trading support

## 📞 **Support & Documentation**

- **Repository**: [https://github.com/ol-s-cloud/agnes-bot-pro](https://github.com/ol-s-cloud/agnes-bot-pro)
- **Issues**: [Report bugs and feature requests](https://github.com/ol-s-cloud/agnes-bot-pro/issues)
- **Trading Dashboard**: `/dashboard/trading` - Main trading interface

---

**Agnes Bot Pro v2.0.0** - Now with **REAL trading capabilities** instead of mock data! 🚀📈

*Ready to start automated trading across traditional and crypto markets with comprehensive analytics.*