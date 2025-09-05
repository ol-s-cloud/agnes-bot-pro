// Comprehensive Crypto Exchange API Integration
import { BaseTradingAPI } from './base.js';

export class BinanceAPI extends BaseTradingAPI {
  constructor(config) {
    super(config);
    this.baseUrl = config.testnet 
      ? 'https://testnet.binance.vision/api/v3' 
      : 'https://api.binance.com/api/v3';
    this.wsUrl = config.testnet
      ? 'wss://testnet.binance.vision/ws'
      : 'wss://stream.binance.com:9443/ws';
  }

  async connect() {
    try {
      const response = await fetch(`${this.baseUrl}/account`, {
        headers: this.getAuthHeaders(),
      });
      
      if (response.ok) {
        this.isConnected = true;
        return true;
      }
      throw new Error('Failed to connect to Binance API');
    } catch (error) {
      console.error('Binance connection error:', error);
      return false;
    }
  }

  async getAccountInfo() {
    this.validateConnection();
    
    const response = await fetch(`${this.baseUrl}/account`, {
      headers: this.getAuthHeaders(),
    });
    
    const data = await response.json();
    
    return {
      balance: parseFloat(data.balances.find(b => b.asset === 'USDT')?.free || '0'),
      equity: this.calculateEquity(data.balances),
      balances: data.balances.reduce((acc, bal) => {
        if (parseFloat(bal.free) > 0 || parseFloat(bal.locked) > 0) {
          acc[bal.asset] = {
            free: parseFloat(bal.free),
            locked: parseFloat(bal.locked)
          };
        }
        return acc;
      }, {}),
      accountType: this.config.testnet ? 'TESTNET' : 'LIVE'
    };
  }

  async placeOrder(order) {
    this.validateConnection();
    
    const binanceOrder = {
      symbol: order.symbol,
      side: order.side,
      type: order.type || 'MARKET',
      quantity: order.quantity,
      price: order.price,
      timeInForce: order.timeInForce || 'GTC',
      timestamp: Date.now()
    };

    const response = await fetch(`${this.baseUrl}/order`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: new URLSearchParams(binanceOrder)
    });

    return await response.json();
  }

  async getMarketData(symbol) {
    const response = await fetch(`${this.baseUrl}/ticker/24hr?symbol=${symbol}`);
    return await response.json();
  }

  getAuthHeaders() {
    const timestamp = Date.now();
    const signature = this.generateSignature(timestamp);
    
    return {
      'X-MBX-APIKEY': this.config.apiKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
  }

  generateSignature(timestamp) {
    // Implement HMAC-SHA256 signature for Binance
    // This is a simplified version - implement proper crypto signing
    return 'signature_placeholder';
  }
}

export class BybitAPI extends BaseTradingAPI {
  constructor(config) {
    super(config);
    this.baseUrl = config.testnet 
      ? 'https://api-testnet.bybit.com' 
      : 'https://api.bybit.com';
  }

  async connect() {
    try {
      const response = await fetch(`${this.baseUrl}/v5/account/wallet-balance`, {
        headers: this.getAuthHeaders(),
      });
      
      if (response.ok) {
        this.isConnected = true;
        return true;
      }
      throw new Error('Failed to connect to Bybit API');
    } catch (error) {
      console.error('Bybit connection error:', error);
      return false;
    }
  }

  async getAccountInfo() {
    this.validateConnection();
    
    const response = await fetch(`${this.baseUrl}/v5/account/wallet-balance?accountType=UNIFIED`, {
      headers: this.getAuthHeaders(),
    });
    
    const data = await response.json();
    
    return {
      balance: parseFloat(data.result?.list?.[0]?.totalWalletBalance || '0'),
      equity: parseFloat(data.result?.list?.[0]?.totalEquity || '0'),
      accountType: this.config.testnet ? 'TESTNET' : 'LIVE'
    };
  }

  async placeOrder(order) {
    this.validateConnection();
    
    const bybitOrder = {
      category: 'spot', // or 'linear' for futures
      symbol: order.symbol,
      side: order.side,
      orderType: order.type || 'Market',
      qty: order.quantity.toString(),
      price: order.price?.toString(),
      timeInForce: order.timeInForce || 'GTC'
    };

    const response = await fetch(`${this.baseUrl}/v5/order/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(bybitOrder)
    });

    return await response.json();
  }

  getAuthHeaders() {
    const timestamp = Date.now();
    const signature = this.generateSignature(timestamp);
    
    return {
      'X-BAPI-API-KEY': this.config.apiKey,
      'X-BAPI-TIMESTAMP': timestamp.toString(),
      'X-BAPI-SIGN': signature,
      'Content-Type': 'application/json'
    };
  }

  generateSignature(timestamp) {
    // Implement HMAC-SHA256 signature for Bybit
    return 'signature_placeholder';
  }
}

export class TradovateAPI extends BaseTradingAPI {
  constructor(config) {
    super(config);
    this.baseUrl = config.demo 
      ? 'https://demo.tradovateapi.com/v1' 
      : 'https://live.tradovateapi.com/v1';
  }

  async connect() {
    try {
      // Tradovate uses OAuth2 authentication
      const authResponse = await fetch(`${this.baseUrl}/auth/oauthtoken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.config.username,
          password: this.config.password,
          appId: this.config.appId,
          appVersion: '1.0.0',
          cid: this.config.cid
        })
      });

      const authData = await authResponse.json();
      
      if (authData.accessToken) {
        this.accessToken = authData.accessToken;
        this.isConnected = true;
        return true;
      }
      
      throw new Error('Tradovate authentication failed');
    } catch (error) {
      console.error('Tradovate connection error:', error);
      return false;
    }
  }

  async getAccountInfo() {
    this.validateConnection();
    
    const response = await fetch(`${this.baseUrl}/account/list`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const accounts = await response.json();
    const account = accounts[0]; // Get first account
    
    return {
      balance: account.balance,
      equity: account.netLiquidationValue,
      dayTradingBuyingPower: account.dayTradingBuyingPower,
      accountType: this.config.demo ? 'DEMO' : 'LIVE'
    };
  }

  async placeOrder(order) {
    this.validateConnection();
    
    const tradovateOrder = {
      accountSpec: this.config.accountId,
      accountId: parseInt(this.config.accountId),
      clOrdId: this.generateOrderId(),
      action: order.side,
      symbol: order.symbol,
      orderQty: order.quantity,
      orderType: order.type || 'Market',
      price: order.price,
      timeInForce: order.timeInForce || 'Day'
    };

    const response = await fetch(`${this.baseUrl}/order/placeorder`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tradovateOrder)
    });

    return await response.json();
  }

  generateOrderId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Market Data APIs
export class CoinGeckoAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.coingecko.com/api/v3';
  }

  async getCryptoPrices(coinIds) {
    const ids = coinIds.join(',');
    const response = await fetch(
      `${this.baseUrl}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
    );
    return await response.json();
  }

  async getMarketData() {
    const response = await fetch(`${this.baseUrl}/global`);
    return await response.json();
  }

  async getTrendingCoins() {
    const response = await fetch(`${this.baseUrl}/search/trending`);
    return await response.json();
  }
}

export class CoinGlassAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://open-api.coinglass.com/public/v2';
  }

  async getLiquidationData(symbol = 'BTC') {
    const response = await fetch(
      `${this.baseUrl}/liquidation?symbol=${symbol}`,
      {
        headers: {
          'coinglassSecret': this.apiKey
        }
      }
    );
    return await response.json();
  }

  async getFundingRates() {
    const response = await fetch(`${this.baseUrl}/fundingRate`, {
      headers: {
        'coinglassSecret': this.apiKey
      }
    });
    return await response.json();
  }

  async getOpenInterest(symbol = 'BTC') {
    const response = await fetch(
      `${this.baseUrl}/openInterest?symbol=${symbol}`,
      {
        headers: {
          'coinglassSecret': this.apiKey
        }
      }
    );
    return await response.json();
  }
}

export class RWAAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.rwa.xyz/v1';
  }

  async getRWATokens() {
    const response = await fetch(`${this.baseUrl}/tokens`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return await response.json();
  }

  async getRWAAnalytics() {
    const response = await fetch(`${this.baseUrl}/analytics`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return await response.json();
  }
}
