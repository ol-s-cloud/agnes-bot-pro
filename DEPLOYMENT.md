# 🚀 Agnes Bot Pro - MVP Deployment Guide

## Quick Start - 5 Minutes to Trading

### 1. **Clone & Install**
```bash
git clone https://github.com/ol-s-cloud/agnes-bot-pro.git
cd agnes-bot-pro
npm install
```

### 2. **Database Setup**
```bash
# Set up your PostgreSQL database first
# Then copy environment file
cp .env.example .env.local

# Edit .env.local with your database URL:
# DATABASE_URL="postgresql://user:pass@host:5432/agnes_bot_pro"

# Generate encryption key
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
# Add the generated key to .env.local

# Initialize database
npx prisma generate
npx prisma db push
```

### 3. **Environment Configuration**

Minimal `.env.local` for MVP:
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/agnes_bot_pro"

# Security
NEXTAUTH_SECRET="your-32-char-secret-here"
ENCRYPTION_KEY="your-64-char-hex-encryption-key"

# Demo Trading (works without API keys)
ENABLE_LIVE_TRADING="false"
DEBUG_TRADING="true"

# Optional: Add real API keys later
# BINANCE_TESTNET_API_KEY="your-key"
# BINANCE_TESTNET_SECRET="your-secret"
```

### 4. **Start Development**
```bash
npm run dev
```

🎉 **Your MVP is ready at http://localhost:3000**

---

## 🎯 MVP Features Ready to Use

### ✅ **Demo Trading (No API Keys Required)**
- Create demo accounts instantly
- Place mock orders with realistic responses
- Portfolio tracking with P&L calculations
- Real-time price simulation

### ✅ **Account Management**
- Demo/Live mode switching
- Multiple trading account support
- Secure API credential storage

### ✅ **Portfolio Management**
- Real-time position tracking
- Profit/Loss calculations
- Portfolio value updates
- Trade history

### ✅ **Security**
- Encrypted API credentials
- User authentication ready
- Input validation

---

## 🚀 Production Deployment

### **Option 1: Vercel (Recommended)**

1. **Connect Repository**
   - Fork this repository
   - Connect to Vercel
   - Import project

2. **Environment Variables**
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=your-secret
   ENCRYPTION_KEY=your-encryption-key
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

3. **Database**
   - Use Railway, Supabase, or PlanetScale
   - Run migrations: `npx prisma db push`

4. **Deploy**
   ```bash
   git push origin main
   ```

### **Option 2: Docker**

```dockerfile
# Dockerfile (create this)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t agnes-bot-pro .
docker run -p 3000:3000 agnes-bot-pro
```

---

## 🔧 Adding Real Trading APIs

### **Binance Integration**

1. **Get API Keys**
   - Go to Binance.com → API Management
   - Create testnet keys first: https://testnet.binance.vision/

2. **Add to Environment**
   ```env
   BINANCE_TESTNET_API_KEY="your-testnet-key"
   BINANCE_TESTNET_SECRET="your-testnet-secret"
   ```

3. **Test Connection**
   - Create account in app
   - Add API credentials
   - Switch to demo mode
   - Place test order

### **Going Live**

1. **Get Live API Keys**
   - Binance live API keys
   - Enable spot trading only initially

2. **Update Environment**
   ```env
   ENABLE_LIVE_TRADING="true"
   BINANCE_LIVE_API_KEY="your-live-key"
   BINANCE_LIVE_SECRET="your-live-secret"
   ```

3. **Safety First**
   - Start with small amounts
   - Test in demo mode first
   - Set position limits

---

## 📊 User Journey - First Trade in 2 Minutes

### **For Users (No Setup Required)**

1. **Sign Up**
   - Visit your deployed app
   - Create account
   - No email verification needed for demo

2. **Create Demo Account**
   - Go to Accounts → Add Account
   - Select "Binance" + "Demo Mode"
   - Skip API keys (uses simulation)

3. **Place First Trade**
   - Navigate to Trading
   - Select BTC/USDT
   - Enter quantity (e.g., 0.001)
   - Click "Buy" → Order filled instantly

4. **See Portfolio**
   - View position in Portfolio tab
   - Watch real-time P&L updates
   - Check trade history

### **For Advanced Users**

1. **Add Real API Keys**
   - Get Binance testnet keys
   - Add to account settings
   - Test with real data

2. **Go Live**
   - Switch to live mode
   - Start with small amounts
   - Scale up gradually

---

## 🛡️ Security Checklist

### **Before Production**
- [ ] Set strong NEXTAUTH_SECRET (32+ chars)
- [ ] Generate secure ENCRYPTION_KEY
- [ ] Use production database
- [ ] Enable HTTPS only
- [ ] Set up monitoring

### **For Live Trading**
- [ ] Test thoroughly in demo mode
- [ ] Start with testnet APIs
- [ ] Limit API permissions
- [ ] Set position size limits
- [ ] Monitor for unusual activity

---

## 🚨 Troubleshooting

### **Common Issues**

**Database Connection Error**
```bash
# Check DATABASE_URL format
# Ensure database exists
npx prisma db push --force-reset
```

**Order Placement Fails**
```bash
# Check if in demo mode (should work without APIs)
# Verify API key permissions
# Check symbol format (e.g., BTCUSDT not BTC/USDT)
```

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

---

## 📈 Next Steps After MVP

1. **Add More Exchanges**
   - Bybit, Coinbase, Kraken
   - Traditional brokers

2. **Advanced Features**
   - Strategy automation
   - Copy trading
   - Advanced analytics

3. **Mobile App**
   - React Native version
   - Push notifications

4. **Enterprise Features**
   - Multi-user accounts
   - API access
   - White-label solutions

---

**🎯 Result: Users can start trading (demo) in under 2 minutes, with live trading ready when they add API keys.**