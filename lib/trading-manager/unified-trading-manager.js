/**
 * Unified Trading Manager - MVP Implementation
 * Handles demo/live switching, account management, and portfolio tracking
 */

import { PrismaClient } from '@prisma/client';
import BinanceAPI from '../trading-apis/binance-api.js';
import { encrypt, decrypt } from '../security/encryption.js';

const prisma = new PrismaClient();

class UnifiedTradingManager {
  constructor() {
    this.connections = new Map(); // Active trading connections
    this.portfolioCache = new Map(); // Portfolio state cache
    this.priceCache = new Map(); // Price cache for P&L calculations
    
    // Initialize price update interval
    this.startPriceUpdates();
  }

  /**
   * ===== ACCOUNT MANAGEMENT =====
   */
  
  async createTradingAccount(userId, config) {
    try {
      // Validate input
      if (!userId || !config.platform) {
        throw new Error('Missing required fields');
      }

      // Encrypt API credentials if provided
      const encryptedApiKey = config.apiKey ? encrypt(config.apiKey) : null;
      const encryptedApiSecret = config.apiSecret ? encrypt(config.apiSecret) : null;

      // Create account in database
      const account = await prisma.tradingAccount.create({
        data: {
          userId,
          platform: config.platform,
          accountType: config.accountType || 'SPOT',
          accountId: config.accountId,
          nickname: config.nickname,
          isDemo: config.isDemo ?? true, // Default to demo
          apiKey: encryptedApiKey,
          apiSecret: encryptedApiSecret,
          apiUrl: config.apiUrl,
        }
      });

      // Create initial portfolio
      await prisma.portfolio.create({
        data: {
          userId,
          tradingAccountId: account.id,
          name: config.nickname || `${config.platform} Portfolio`,
        }
      });

      console.log(`✅ Created ${config.isDemo ? 'demo' : 'live'} account:`, account.id);
      return account;
    } catch (error) {
      console.error('❌ Account creation failed:', error);
      throw error;
    }
  }

  async switchAccountMode(accountId, isDemo) {
    try {
      const account = await prisma.tradingAccount.update({
        where: { id: accountId },
        data: { isDemo }
      });

      // Disconnect existing connection
      this.disconnectAccount(accountId);
      
      // Clear portfolio cache
      this.portfolioCache.delete(accountId);

      console.log(`🔄 Switched account ${accountId} to ${isDemo ? 'demo' : 'live'} mode`);
      return account;
    } catch (error) {
      console.error('❌ Mode switch failed:', error);
      throw error;
    }
  }

  /**
   * ===== TRADING CONNECTION MANAGEMENT =====
   */
  
  async connectAccount(accountId) {
    try {
      const account = await prisma.tradingAccount.findUnique({
        where: { id: accountId }
      });

      if (!account) {
        throw new Error('Account not found');
      }

      // Skip if already connected
      if (this.connections.has(accountId)) {
        return this.connections.get(accountId);
      }

      let api;
      switch (account.platform) {
        case 'BINANCE':
          api = await this.connectBinance(account);
          break;
        case 'BYBIT':
          api = await this.connectBybit(account);
          break;
        default:
          throw new Error(`Platform ${account.platform} not supported yet`);
      }

      this.connections.set(accountId, api);
      console.log(`🔗 Connected to ${account.platform} (${account.isDemo ? 'demo' : 'live'})`);
      
      return api;
    } catch (error) {
      console.error('❌ Connection failed:', error);
      throw error;
    }
  }

  async connectBinance(account) {
    const config = {
      isDemo: account.isDemo,
      apiKey: account.apiKey ? decrypt(account.apiKey) : null,
      apiSecret: account.apiSecret ? decrypt(account.apiSecret) : null,
    };

    const api = new BinanceAPI(config);
    
    // Test connection
    try {
      await api.getAccountInfo();
      return api;
    } catch (error) {
      console.warn('⚠️ API test failed, continuing with demo mode');
      return new BinanceAPI({ isDemo: true });
    }
  }

  async connectBybit(account) {
    // TODO: Implement Bybit connection
    console.log('📝 Bybit connection - coming soon');
    return null;
  }

  disconnectAccount(accountId) {
    const connection = this.connections.get(accountId);
    if (connection && connection.disconnect) {
      connection.disconnect();
    }
    this.connections.delete(accountId);
  }

  /**
   * ===== ORDER MANAGEMENT =====
   */
  
  async placeOrder(userId, accountId, orderData) {
    try {
      // Get trading connection
      const api = await this.connectAccount(accountId);
      if (!api) {
        throw new Error('Failed to connect to trading platform');
      }

      // Validate order
      const account = await prisma.tradingAccount.findUnique({
        where: { id: accountId }
      });

      if (account.userId !== userId) {
        throw new Error('Unauthorized account access');
      }

      // Create order record
      const orderRecord = await prisma.order.create({
        data: {
          userId,
          tradingAccountId: accountId,
          symbol: orderData.symbol,
          side: orderData.side,
          type: orderData.type,
          quantity: orderData.quantity,
          price: orderData.price,
          stopPrice: orderData.stopPrice,
          status: 'PENDING',
          clientOrderId: `agnes_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      });

      // Submit to exchange
      try {
        const result = await api.placeOrder({
          ...orderData,
          clientOrderId: orderRecord.clientOrderId
        });

        // Update order with exchange response
        const updatedOrder = await prisma.order.update({
          where: { id: orderRecord.id },
          data: {
            status: result.status || 'SUBMITTED',
            externalOrderId: result.orderId || result.id,
            filledQuantity: result.executedQty || 0,
            avgFillPrice: result.price || result.avgPrice,
            ...(result.transactTime && { filledAt: new Date(result.transactTime) })
          }
        });

        // Update portfolio if filled
        if (result.status === 'FILLED') {
          await this.updatePortfolioFromFill(accountId, updatedOrder, result);
        }

        console.log(`✅ Order placed: ${orderRecord.symbol} ${orderRecord.side} ${orderRecord.quantity}`);
        return updatedOrder;

      } catch (exchangeError) {
        // Update order as rejected
        await prisma.order.update({
          where: { id: orderRecord.id },
          data: { status: 'REJECTED' }
        });
        throw exchangeError;
      }

    } catch (error) {
      console.error('❌ Order placement failed:', error);
      throw error;
    }
  }

  /**
   * ===== PORTFOLIO MANAGEMENT =====
   */
  
  async updatePortfolioFromFill(accountId, order, fillData) {
    try {
      const portfolio = await prisma.portfolio.findFirst({
        where: { tradingAccountId: accountId }
      });

      if (!portfolio) return;

      // Find or create position
      let position = await prisma.position.findUnique({
        where: {
          portfolioId_symbol: {
            portfolioId: portfolio.id,
            symbol: order.symbol
          }
        }
      });

      const fillQty = parseFloat(fillData.executedQty || order.filledQuantity);
      const fillPrice = parseFloat(fillData.avgPrice || order.avgFillPrice);

      if (!position) {
        // Create new position
        position = await prisma.position.create({
          data: {
            portfolioId: portfolio.id,
            tradingAccountId: accountId,
            symbol: order.symbol,
            side: order.side,
            quantity: fillQty,
            avgPrice: fillPrice,
            currentPrice: fillPrice,
            marketValue: fillQty * fillPrice,
            costBasis: fillQty * fillPrice,
            unrealizedPnL: 0,
            totalPnL: 0,
            pnlPercent: 0
          }
        });
      } else {
        // Update existing position
        const newQty = order.side === 'BUY' 
          ? parseFloat(position.quantity) + fillQty
          : parseFloat(position.quantity) - fillQty;

        if (newQty <= 0) {
          // Position closed
          await prisma.position.update({
            where: { id: position.id },
            data: { 
              quantity: 0,
              closedAt: new Date(),
              realizedPnL: (fillPrice - parseFloat(position.avgPrice)) * fillQty
            }
          });
        } else {
          // Update position
          const newAvgPrice = order.side === 'BUY'
            ? ((parseFloat(position.quantity) * parseFloat(position.avgPrice)) + (fillQty * fillPrice)) / newQty
            : parseFloat(position.avgPrice);

          await prisma.position.update({
            where: { id: position.id },
            data: {
              quantity: newQty,
              avgPrice: newAvgPrice,
              marketValue: newQty * fillPrice,
              costBasis: newQty * newAvgPrice
            }
          });
        }
      }

      // Update portfolio totals
      await this.recalculatePortfolio(portfolio.id);

    } catch (error) {
      console.error('❌ Portfolio update failed:', error);
    }
  }

  async recalculatePortfolio(portfolioId) {
    try {
      const positions = await prisma.position.findMany({
        where: { 
          portfolioId,
          quantity: { gt: 0 }
        }
      });

      let totalValue = 0;
      let totalCost = 0;
      let totalPnL = 0;

      for (const position of positions) {
        const currentPrice = await this.getCurrentPrice(position.symbol);
        const marketValue = parseFloat(position.quantity) * currentPrice;
        const costBasis = parseFloat(position.costBasis);
        const unrealizedPnL = marketValue - costBasis;

        // Update position with current prices
        await prisma.position.update({
          where: { id: position.id },
          data: {
            currentPrice,
            marketValue,
            unrealizedPnL,
            totalPnL: unrealizedPnL + parseFloat(position.realizedPnL),
            pnlPercent: costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0
          }
        });

        totalValue += marketValue;
        totalCost += costBasis;
        totalPnL += unrealizedPnL;
      }

      // Update portfolio
      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: {
          totalValue,
          totalCost,
          totalPnL,
          totalPnLPercent: totalCost > 0 ? (totalPnL / totalCost) * 100 : 0
        }
      });

    } catch (error) {
      console.error('❌ Portfolio recalculation failed:', error);
    }
  }

  /**
   * ===== MARKET DATA =====
   */
  
  async getCurrentPrice(symbol) {
    try {
      // Check cache first
      const cached = this.priceCache.get(symbol);
      if (cached && Date.now() - cached.timestamp < 5000) { // 5 second cache
        return cached.price;
      }

      // Get from any available connection
      for (const [accountId, api] of this.connections) {
        try {
          const ticker = await api.getTicker24hr(symbol);
          const price = parseFloat(ticker.price || ticker.lastPrice);
          
          // Cache the price
          this.priceCache.set(symbol, {
            price,
            timestamp: Date.now()
          });
          
          return price;
        } catch (error) {
          continue; // Try next connection
        }
      }

      // Fallback to mock price for demo
      console.warn(`📊 Using mock price for ${symbol}`);
      return 45000 + Math.random() * 10000;

    } catch (error) {
      console.warn('📊 Price fetch failed, using cached/mock:', error.message);
      return this.priceCache.get(symbol)?.price || 45000;
    }
  }

  startPriceUpdates() {
    // Update portfolio values every 30 seconds
    setInterval(async () => {
      try {
        const portfolios = await prisma.portfolio.findMany({
          where: {
            positions: {
              some: {
                quantity: { gt: 0 }
              }
            }
          }
        });

        for (const portfolio of portfolios) {
          await this.recalculatePortfolio(portfolio.id);
        }
      } catch (error) {
        console.error('📊 Price update error:', error);
      }
    }, 30000);
  }

  /**
   * ===== USER QUERIES =====
   */
  
  async getUserAccounts(userId) {
    return await prisma.tradingAccount.findMany({
      where: { userId },
      include: {
        portfolios: {
          include: {
            positions: {
              where: {
                quantity: { gt: 0 }
              }
            }
          }
        }
      }
    });
  }

  async getUserPortfolio(userId, accountId = null) {
    const where = accountId 
      ? { userId, tradingAccountId: accountId }
      : { userId };

    return await prisma.portfolio.findMany({
      where,
      include: {
        positions: {
          where: {
            quantity: { gt: 0 }
          }
        },
        tradingAccount: true
      }
    });
  }

  async getUserOrders(userId, limit = 50) {
    return await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        tradingAccount: true,
        fills: true
      }
    });
  }

  /**
   * ===== CLEANUP =====
   */
  
  async cleanup() {
    // Disconnect all connections
    for (const [accountId, connection] of this.connections) {
      this.disconnectAccount(accountId);
    }
    
    // Clear caches
    this.portfolioCache.clear();
    this.priceCache.clear();
    
    // Close database connection
    await prisma.$disconnect();
  }
}

// Export singleton instance
export default new UnifiedTradingManager();