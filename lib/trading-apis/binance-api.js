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
   * Authentication
   */
  generateSignature(queryString) {
    // Browser-compatible HMAC SHA256
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(queryString + this.apiSecret))
      .then(buffer => Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0')).join(''));
  }

  getTimestamp() {
    return Date.now();
  }

  /**
   * Market Data
   */
  async getExchangeInfo() {
    const response = await this.makeRequest('/v3/exchangeInfo');
    return response;
  }

  async getTicker24hr(symbol = null) {
    const endpoint = symbol 
      ? `/v3/ticker/24hr?symbol=${symbol}`
      : '/v3/ticker/24hr';
    
    const response = await this.makeRequest(endpoint);
    return response;
  }

  async getKlines(symbol, interval, limit = 500) {
    const endpoint = `/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const response = await this.makeRequest(endpoint);
    return response;
  }

  /**
   * WebSocket Streams
   */
  async connectWebSocket() {
    return new Promise((resolve, reject) => {
      this.wsConnection = new WebSocket(this.wsBaseUrl);
      
      this.wsConnection.onopen = () => {
        console.log(`Binance ${this.isDemo ? 'Testnet' : 'Live'} WebSocket connected`);
        resolve(true);
      };

      this.wsConnection.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      };

      this.wsConnection.onerror = (error) => {
        console.error('Binance WebSocket error:', error);
        reject(error);
      };

      this.wsConnection.onclose = () => {
        console.log('Binance WebSocket disconnected');
      };
    });
  }

  subscribeToTicker(symbol) {
    const stream = `${symbol.toLowerCase()}@ticker`;
    this.subscriptions.set(stream, 'ticker');
    
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: [stream],
        id: Date.now()
      }));
    }
  }

  handleWebSocketMessage(data) {
    if (data.stream) {
      const streamType = this.subscriptions.get(data.stream);
      
      switch (streamType) {
        case 'ticker':
          this.onTickerUpdate?.(data.data);
          break;
        case 'kline':
          this.onKlineUpdate?.(data.data);
          break;
        default:
          console.log('Unhandled Binance stream:', data);
      }
    }
  }

  /**
   * Trading Operations
   */
  async placeOrder(orderData) {
    const params = {
      symbol: orderData.symbol,
      side: orderData.side.toUpperCase(),
      type: orderData.type.toUpperCase(),
      quantity: orderData.quantity,
      timestamp: this.getTimestamp()
    };

    if (orderData.type.toUpperCase() === 'LIMIT') {
      params.price = orderData.price;
      params.timeInForce = orderData.timeInForce || 'GTC';
    }

    const response = await this.makeSignedRequest('/v3/order', 'POST', params);
    return response;
  }

  async getAccountInfo() {
    const params = {
      timestamp: this.getTimestamp()
    };

    const response = await this.makeSignedRequest('/v3/account', 'GET', params);
    return response;
  }

  /**
   * Utility Methods
   */
  async makeRequest(endpoint, method = 'GET') {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'X-MBX-APIKEY': this.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Binance API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async makeSignedRequest(endpoint, method = 'GET', params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const signature = await this.generateSignature(queryString);
    
    const url = `${this.baseUrl}${endpoint}?${queryString}&signature=${signature}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'X-MBX-APIKEY': this.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Binance API Error: ${errorData.msg || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Event Handlers (Override these)
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
  }
}

export default BinanceAPI;