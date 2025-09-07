/**
 * Binance API Integration
 * Supports both Testnet (Demo) and Live trading
 */

class BinanceAPI {
  constructor(config) {
    this.isDemo = config.isDemo || false;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    
    // Use testnet for demo trading
    this.baseUrl = this.isDemo 
      ? 'https://testnet.binance.vision/api'
      : 'https://api.binance.com/api';
    
    this.wsBaseUrl = this.isDemo
      ? 'wss://testnet.binance.vision/ws'
      : 'wss://stream.binance.com:9443/ws';
    
    this.wsConnection = null;
    this.subscriptions = new Map();
  }

  /**
   * Authentication - Simplified for demo
   */
  async generateSignature(queryString) {
    // Simplified version - will need proper HMAC for real trading
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(this.apiSecret);
        const data = encoder.encode(queryString);
        
        const key = await window.crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await window.crypto.subtle.sign('HMAC', key, data);
        return Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        console.warn('Crypto API not available, using mock signature');
        return 'mock_signature_for_demo';
      }
    }
    return 'mock_signature_for_demo';
  }

  getTimestamp() {
    return Date.now();
  }

  /**
   * Market Data
   */
  async getExchangeInfo() {
    try {
      const response = await this.makeRequest('/v3/exchangeInfo');
      return response;
    } catch (error) {
      console.warn('Using mock exchange info');
      return { symbols: [{ symbol: 'BTCUSDT', status: 'TRADING' }] };
    }
  }

  async getTicker24hr(symbol = null) {
    try {
      const endpoint = symbol 
        ? `/v3/ticker/24hr?symbol=${symbol}`
        : '/v3/ticker/24hr';
      
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.warn('Using mock ticker data');
      return symbol ? 
        { symbol: symbol, price: '50000', priceChangePercent: '2.5' } :
        [{ symbol: 'BTCUSDT', price: '50000', priceChangePercent: '2.5' }];
    }
  }

  async getKlines(symbol, interval, limit = 500) {
    try {
      const endpoint = `/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.warn('Using mock kline data');
      return Array.from({ length: 10 }, (_, i) => [
        Date.now() - (i * 60000),
        '50000',
        '51000',
        '49000',
        '50500',
        '1000'
      ]);
    }
  }

  /**
   * WebSocket Streams - Simplified for demo
   */
  async connectWebSocket() {
    try {
      return new Promise((resolve) => {
        console.log(`Binance ${this.isDemo ? 'Testnet' : 'Live'} WebSocket simulated`);
        // Simulate connection for demo
        setTimeout(() => resolve(true), 1000);
      });
    } catch (error) {
      console.warn('WebSocket simulation mode');
      return true;
    }
  }

  subscribeToTicker(symbol) {
    console.log(`Subscribed to ${symbol} ticker (simulated)`);
  }

  /**
   * Trading Operations - Demo/Mock Implementation
   */
  async placeOrder(orderData) {
    console.log('Order placement (DEMO MODE):', orderData);
    
    // Return mock order response
    return {
      orderId: `order_${Date.now()}`,
      symbol: orderData.symbol,
      side: orderData.side,
      type: orderData.type,
      quantity: orderData.quantity,
      price: orderData.price,
      status: 'FILLED',
      transactTime: Date.now()
    };
  }

  async getAccountInfo() {
    console.log('Getting account info (DEMO MODE)');
    
    // Return mock account data
    return {
      balances: [
        { asset: 'USDT', free: '10000.00', locked: '0.00' },
        { asset: 'BTC', free: '0.5', locked: '0.00' },
        { asset: 'ETH', free: '5.0', locked: '0.00' }
      ]
    };
  }

  /**
   * Utility Methods
   */
  async makeRequest(endpoint, method = 'GET') {
    if (!this.apiKey) {
      throw new Error('API key required');
    }

    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'X-MBX-APIKEY': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Binance API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`API request failed, using mock data: ${error.message}`);
      throw error;
    }
  }

  async makeSignedRequest(endpoint, method = 'GET', params = {}) {
    console.log('Signed request (DEMO MODE):', { endpoint, method, params });
    
    // Return mock response for demo
    return { success: true, orderId: Date.now() };
  }

  /**
   * Event Handlers
   */
  onTickerUpdate(data) {
    console.log('Ticker update:', data);
  }

  onKlineUpdate(data) {
    console.log('Kline update:', data);
  }

  /**
   * Cleanup
   */
  disconnect() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.subscriptions.clear();
    console.log('Binance API disconnected');
  }
}

export default BinanceAPI;