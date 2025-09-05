# 🚀 Agnes Bot Pro - Deployment Guide

## Quick Deploy to Vercel

### 1. Clone the Repository
```bash
git clone https://github.com/ol-s-cloud/agnes-bot-pro.git
cd agnes-bot-pro
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create `.env.local` file:
```env
# Database (Required)
DATABASE_URL="postgresql://username:password@host:5432/dbname"

# Authentication (Required)
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Trading APIs (Required for live trading)
APEX_API_KEY="your-apex-api-key"
APEX_API_SECRET="your-apex-api-secret"
NINJA_TRADER_API_URL="http://localhost:8080"

# Stripe (Required for payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 4. Database Setup

#### Option A: Railway (Recommended)
1. Go to [Railway.app](https://railway.app)
2. Create new project → PostgreSQL
3. Copy the DATABASE_URL
4. Run migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### 5. Deploy to Vercel

#### Method 1: Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

#### Method 2: GitHub Integration
1. Push to GitHub
2. Go to [Vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard
5. Deploy!

## 🔧 Local Development

### 1. Start Development Server
```bash
npm run dev
```

### 2. Database Commands
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Open Prisma Studio
npm run db:studio
```

### 3. View Your App
Open [http://localhost:3000](http://localhost:3000)

## 🎯 Features Included

### ✅ Core Features
- [x] User authentication (email, GitHub, Google)
- [x] Landing page with pricing
- [x] User dashboard with overview
- [x] Strategy builder (visual + code)
- [x] Bot management interface
- [x] Multi-broker account support
- [x] Database schema (PostgreSQL)
- [x] ICT trading strategy template

## 🎉 Success!

Once deployed, your trading bot platform will be live at:
`https://your-project-name.vercel.app`

**Happy Trading!** 🚀📈
