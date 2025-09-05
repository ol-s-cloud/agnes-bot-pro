// ICT (Inner Circle Trader) Strategy Implementation
export class ICTStrategy {
  constructor(config) {
    this.config = {
      timeframes: ['5m', '15m'],
      instruments: ['ES', 'NQ'],
      riskPercent: 1.0,
      stopLossPoints: 20,
      takeProfitPoints: 40,
      ...config
    };
    
    this.indicators = {
      ema_fast: new EMA(10),
      ema_slow: new EMA(50),
      rsi: new RSI(14)
    };
    
    this.positions = [];
    this.isActive = false;
  }

  // Detect Fair Value Gap (FVG)
  detectFVG(candles) {
    if (candles.length < 3) return null;
    
    const [candle1, candle2, candle3] = candles.slice(-3);
    
    // Bullish FVG: candle1.high < candle3.low
    if (candle1.high < candle3.low) {
      return {
        type: 'bullish',
        high: candle3.low,
        low: candle1.high,
        timestamp: candle3.timestamp
      };
    }
    
    // Bearish FVG: candle1.low > candle3.high
    if (candle1.low > candle3.high) {
      return {
        type: 'bearish',
        high: candle1.low,
        low: candle3.high,
        timestamp: candle3.timestamp
      };
    }
    
    return null;
  }

  // Main strategy logic
  onTick(data) {
    if (!this.isActive) return;
    
    // Update indicators
    this.indicators.ema_fast.update(data.close);
    this.indicators.ema_slow.update(data.close);
    this.indicators.rsi.update(data.close);
    
    const fvg = this.detectFVG(data.candles);
    
    // Entry conditions
    if (this.shouldEnterLong(data, fvg)) {
      this.enterLong(data);
    } else if (this.shouldEnterShort(data, fvg)) {
      this.enterShort(data);
    }
    
    // Manage existing positions
    this.managePositions(data);
  }

  shouldEnterLong(data, fvg) {
    const emaFast = this.indicators.ema_fast.getValue();
    const emaSlow = this.indicators.ema_slow.getValue();
    const rsi = this.indicators.rsi.getValue();
    
    return (
      data.close > emaFast &&
      emaFast > emaSlow &&
      fvg && fvg.type === 'bullish' &&
      rsi < 70 &&
      this.positions.length < this.config.maxPositions
    );
  }

  shouldEnterShort(data, fvg) {
    const emaFast = this.indicators.ema_fast.getValue();
    const emaSlow = this.indicators.ema_slow.getValue();
    const rsi = this.indicators.rsi.getValue();
    
    return (
      data.close < emaFast &&
      emaFast < emaSlow &&
      fvg && fvg.type === 'bearish' &&
      rsi > 30 &&
      this.positions.length < this.config.maxPositions
    );
  }

  start() {
    this.isActive = true;
  }

  stop() {
    this.isActive = false;
  }

  getStatus() {
    return {
      isActive: this.isActive,
      positionsCount: this.positions.length,
      config: this.config
    };
  }
}

// Simple EMA indicator
class EMA {
  constructor(period) {
    this.period = period;
    this.multiplier = 2 / (period + 1);
    this.value = null;
  }

  update(price) {
    if (this.value === null) {
      this.value = price;
    } else {
      this.value = (price * this.multiplier) + (this.value * (1 - this.multiplier));
    }
  }

  getValue() {
    return this.value;
  }
}

// Simple RSI indicator
class RSI {
  constructor(period) {
    this.period = period;
    this.prices = [];
    this.gains = [];
    this.losses = [];
  }

  update(price) {
    this.prices.push(price);
    
    if (this.prices.length > 1) {
      const change = price - this.prices[this.prices.length - 2];
      this.gains.push(change > 0 ? change : 0);
      this.losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    // Keep only the last 'period' values
    if (this.prices.length > this.period + 1) {
      this.prices.shift();
      this.gains.shift();
      this.losses.shift();
    }
  }

  getValue() {
    if (this.gains.length < this.period) return 50;
    
    const avgGain = this.gains.reduce((a, b) => a + b) / this.period;
    const avgLoss = this.losses.reduce((a, b) => a + b) / this.period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }
}
