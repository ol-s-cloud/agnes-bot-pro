/**
 * Unified Trading Manager
 * Manages multiple trading platforms (Traditional + Crypto) with demo/live switching
 */

import TradovateAPI from '../trading-apis/tradovate-api.js';
import NinjaTraderAPI from '../trading-apis/ninjatrader-api.js';
import BinanceAPI from '../trading-apis/binance-api.js';
import BybitAPI from '../trading-apis/bybit-api.js';
import CoinGeckoAPI from '../analytics-apis/coingecko-api.js';
import CoinMarketCapAPI from '../analytics-apis/coinmarketcap-api.js';
import CoinGlassAPI from '../analytics-apis/coinglass-api.js';
import RWAAPI from '../analytics-apis/rwa-api.js';

class UnifiedTradingManager {
  constructor(config) {
    this.config = config;
    this.isDemo = config.isDemo || false;
    this.platforms = new Map();
    this.analytics = new Map();
    this.subscriptions = new Map();
    this.isConnected = false;
    
    // Event handlers
    this.onPriceUpdate = null;
    this.onOrderUpdate = null;
    this.onPositionUpdate = null;
    this.onAnalyticsUpdate = null;
    this.onError = null;
    
    this.initializePlatforms();
    this.initializeAnalytics();
  }

  /**
   * Initialize Trading Platforms
   */
  initializePlatforms() {
    // Traditional Markets
    if (this.config.tradovate) {
      const tradovate = new TradovateAPI({
        isDemo: this.isDemo,
        credentials: this.config.tradovate
      });
      
      // Set up event handlers
      tradovate.onPriceUpdate = (data) => this.handlePriceUpdate('tradovate', data);
      tradovate.onOrderUpdate = (data) => this.handleOrderUpdate('tradovate', data);
      
      this.platforms.set('tradovate', tradovate);
    }

    if (this.config.ninjatrader) {
      const ninja = new NinjaTraderAPI({
        isDemo: this.isDemo,
        baseUrl: this.config.ninjatrader.baseUrl,
        liveAccount: this.config.ninjatrader.liveAccount
      });
      
      // Set up event handlers
      ninja.onMarketDataUpdate = (data) => this.handlePriceUpdate('ninjatrader', data);
      ninja.onOrderUpdate = (data) => this.handleOrderUpdate('ninjatrader', data);
      ninja.onPositionUpdate = (data) => this.handlePositionUpdate('ninjatrader', data);
      
      this.platforms.set('ninjatrader', ninja);
    }

    // Crypto Exchanges
    if (this.config.binance) {
      const binance = new BinanceAPI({
        isDemo: this.isDemo,
        apiKey: this.config.binance.apiKey,
        apiSecret: this.config.binance.apiSecret
      });
      
      // Set up event handlers
      binance.onTickerUpdate = (data) => this.handlePriceUpdate('binance', data);
      binance.onKlineUpdate = (data) => this.handleKlineUpdate('binance', data);
      
      this.platforms.set('binance', binance);
    }

    if (this.config.bybit) {
      const bybit = new BybitAPI({
        isDemo: this.isDemo,
        apiKey: this.config.bybit.apiKey,
        apiSecret: this.config.bybit.apiSecret
      });
      
      // Set up event handlers
      bybit.onTickerUpdate = (data) => this.handlePriceUpdate('bybit', data);
      bybit.onOrderUpdate = (data) => this.handleOrderUpdate('bybit', data);
      bybit.onExecutionUpdate = (data) => this.handleExecutionUpdate('bybit', data);
      
      this.platforms.set('bybit', bybit);
    }
  }

  /**
   * Initialize Analytics Platforms
   */
  initializeAnalytics() {
    // CoinGecko
    if (this.config.coingecko) {
      const coinGecko = new CoinGeckoAPI({
        apiKey: this.config.coingecko.apiKey,
        rateLimitDelay: this.config.coingecko.rateLimitDelay
      });
      this.analytics.set('coingecko', coinGecko);
    }

    // CoinMarketCap
    if (this.config.coinmarketcap) {
      const cmc = new CoinMarketCapAPI({
        apiKey: this.config.coinmarketcap.apiKey,
        sandbox: this.isDemo
      });
      this.analytics.set('coinmarketcap', cmc);
    }

    // CoinGlass
    if (this.config.coinglass) {
      const coinGlass = new CoinGlassAPI({
        rateLimitDelay: this.config.coinglass.rateLimitDelay
      });
      this.analytics.set('coinglass', coinGlass);
    }

    // RWA.xyz
    if (this.config.rwa) {
      const rwa = new RWAAPI({
        apiKey: this.config.rwa.apiKey,
        rateLimitDelay: this.config.rwa.rateLimitDelay
      });
      this.analytics.set('rwa', rwa);
    }
  }

  /**
   * Connection Management
   */
  async connectAll() {
    const connectionPromises = [];
    
    // Connect trading platforms
    for (const [name, platform] of this.platforms) {
      try {
        if (platform.authenticate) {
          connectionPromises.push(platform.authenticate());
        } else if (platform.connect) {
          connectionPromises.push(platform.connect());
        }
        
        if (platform.connectWebSocket) {
          connectionPromises.push(platform.connectWebSocket());
        }
      } catch (error) {
        console.error(`Failed to connect to ${name}:`, error);
        this.handleError(name, error);
      }
    }

    try {
      await Promise.allSettled(connectionPromises);
      this.isConnected = true;
      console.log(`Connected to ${this.platforms.size} trading platforms in ${this.isDemo ? 'DEMO' : 'LIVE'} mode`);
      return { success: true, connectedPlatforms: Array.from(this.platforms.keys()) };
    } catch (error) {
      console.error('Failed to connect to all platforms:', error);
      return { success: false, error: error.message };
    }
  }

  async disconnectAll() {
    for (const [name, platform] of this.platforms) {
      try {
        if (platform.disconnect) {
          platform.disconnect();
        }
      } catch (error) {
        console.error(`Failed to disconnect from ${name}:`, error);
      }
    }
    
    this.isConnected = false;
    this.subscriptions.clear();
  }

  /**
   * Demo/Live Mode Switching
   */
  async switchMode(isDemo) {
    if (this.isDemo === isDemo) {
      return { success: true, message: `Already in ${isDemo ? 'demo' : 'live'} mode` };
    }

    // Disconnect current connections
    await this.disconnectAll();
    
    // Update mode
    this.isDemo = isDemo;
    
    // Reinitialize platforms with new mode
    this.platforms.clear();
    this.initializePlatforms();
    
    // Reconnect
    const result = await this.connectAll();
    
    return {
      success: result.success,
      message: `Switched to ${isDemo ? 'DEMO' : 'LIVE'} mode`,
      connectedPlatforms: result.connectedPlatforms
    };
  }

  /**
   * Unified Trading Operations
   */
  async placeOrder(platform, orderData) {
    const tradingPlatform = this.platforms.get(platform);
    
    if (!tradingPlatform) {
      throw new Error(`Platform ${platform} not available`);
    }

    try {
      // Normalize order data based on platform
      const normalizedOrder = this.normalizeOrderData(platform, orderData);
      
      // Place order
      const result = await tradingPlatform.placeOrder(normalizedOrder);
      
      // Normalize response
      return this.normalizeOrderResponse(platform, result);
    } catch (error) {
      this.handleError(platform, error);
      throw error;
    }
  }

  async getMarketOverview() {
    const overview = {};
    
    // Get crypto market overview
    if (this.analytics.has('coingecko')) {
      try {
        const coinGecko = this.analytics.get('coingecko');
        overview.crypto = await coinGecko.getMarketOverview();
      } catch (error) {
        console.error('Failed to get CoinGecko overview:', error);
      }
    }

    // Get derivatives data
    if (this.analytics.has('coinglass')) {
      try {
        const coinGlass = this.analytics.get('coinglass');
        overview.derivatives = await coinGlass.getDerivativesOverview('BTC');
      } catch (error) {
        console.error('Failed to get CoinGlass data:', error);
      }
    }

    return overview;
  }

  // Additional methods for order management, position tracking, etc.
  // ... (implementation continues)
}

export default UnifiedTradingManager;