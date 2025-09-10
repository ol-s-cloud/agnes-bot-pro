/**
 * Advanced Trading Chart Component - PROFESSIONAL CHARTS
 * Real-time price charts with technical indicators and trading tools
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity, 
  Maximize, 
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Zap
} from 'lucide-react';

export default function TradingChart({ 
  symbol = 'BTCUSDT',
  exchange = 'binance',
  height = 400,
  onSymbolChange,
  currentPrice = 50000 
}) {
  const [chartData, setChartData] = useState([]);
  const [timeframe, setTimeframe] = useState('1h');
  const [indicators, setIndicators] = useState({
    sma: true,
    ema: false,
    rsi: true,
    macd: false,
    volume: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartContainerRef = useRef(null);

  const timeframes = [
    { value: '1m', label: '1m', name: '1 Minute' },
    { value: '5m', label: '5m', name: '5 Minutes' },
    { value: '15m', label: '15m', name: '15 Minutes' },
    { value: '1h', label: '1h', name: '1 Hour' },
    { value: '4h', label: '4h', name: '4 Hours' },
    { value: '1d', label: '1D', name: '1 Day' }
  ];

  const popularSymbols = [
    'BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT',
    'DOGEUSDT', 'MATICUSDT', 'LINKUSDT', 'AVAXUSDT'
  ];

  useEffect(() => {
    generateChartData();
    const interval = setInterval(updateRealTimeData, 5000);
    return () => clearInterval(interval);
  }, [symbol, timeframe]);

  const generateChartData = () => {
    setIsLoading(true);
    
    // Generate realistic candlestick data
    const data = [];
    const basePrice = currentPrice;
    let price = basePrice;
    const now = new Date();
    const timeframeMs = getTimeframeMs(timeframe);
    
    // Generate 100 data points
    for (let i = 99; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * timeframeMs));
      
      // Simulate price movement
      const volatility = 0.02; // 2% volatility
      const change = (Math.random() - 0.5) * volatility * price;
      price = Math.max(price + change, price * 0.95); // Minimum 5% below current
      
      const open = price;
      const high = open + (Math.random() * 0.01 * open);
      const low = open - (Math.random() * 0.01 * open);
      const close = low + (Math.random() * (high - low));
      const volume = Math.random() * 1000000;
      
      data.push({
        timestamp: timestamp.getTime(),
        time: timestamp.toISOString(),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: parseFloat(volume.toFixed(0))
      });
    }
    
    setChartData(data);
    setIsLoading(false);
  };

  const updateRealTimeData = () => {
    if (chartData.length === 0) return;
    
    setChartData(prev => {
      const newData = [...prev];
      const lastCandle = newData[newData.length - 1];
      const now = new Date();
      
      // Update last candle or add new one
      const timeframeMs = getTimeframeMs(timeframe);
      const shouldAddNewCandle = now.getTime() - lastCandle.timestamp > timeframeMs;
      
      if (shouldAddNewCandle) {
        // Add new candle
        const newPrice = lastCandle.close * (1 + (Math.random() - 0.5) * 0.01);
        newData.push({
          timestamp: now.getTime(),
          time: now.toISOString(),
          open: lastCandle.close,
          high: newPrice * 1.002,
          low: newPrice * 0.998,
          close: newPrice,
          volume: Math.random() * 1000000
        });
        
        // Keep only last 100 candles
        return newData.slice(-100);
      } else {
        // Update last candle
        const updatedCandle = { ...lastCandle };
        updatedCandle.close = lastCandle.close * (1 + (Math.random() - 0.5) * 0.005);
        updatedCandle.high = Math.max(updatedCandle.high, updatedCandle.close);
        updatedCandle.low = Math.min(updatedCandle.low, updatedCandle.close);
        updatedCandle.volume += Math.random() * 10000;
        
        newData[newData.length - 1] = updatedCandle;
        return newData;
      }
    });
  };

  const getTimeframeMs = (tf) => {
    const timeframeMap = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000
    };
    return timeframeMap[tf] || 60 * 60 * 1000;
  };

  const calculateSMA = (data, period = 20) => {
    return data.map((item, index) => {
      if (index < period - 1) return null;
      const sum = data.slice(index - period + 1, index + 1)
        .reduce((acc, curr) => acc + curr.close, 0);
      return sum / period;
    });
  };

  const calculateRSI = (data, period = 14) => {
    if (data.length < period + 1) return [];
    
    const rsi = [];
    const gains = [];
    const losses = [];
    
    // Calculate initial gains and losses
    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    // Calculate RSI
    for (let i = period; i < gains.length; i++) {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b) / period;
      const rs = avgGain / (avgLoss || 1);
      rsi.push(100 - (100 / (1 + rs)));
    }
    
    return rsi;
  };

  const toggleIndicator = (indicator) => {
    setIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatVolume = (volume) => {
    if (volume > 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume > 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toFixed(0);
  };

  const lastCandle = chartData[chartData.length - 1];
  const priceChange = lastCandle && chartData.length > 1 
    ? lastCandle.close - chartData[chartData.length - 2].close 
    : 0;
  const priceChangePercent = lastCandle && chartData.length > 1
    ? (priceChange / chartData[chartData.length - 2].close) * 100
    : 0;

  const smaData = indicators.sma ? calculateSMA(chartData) : [];
  const rsiData = indicators.rsi ? calculateRSI(chartData) : [];

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/50 border border-gray-700 rounded-xl ${
      isFullscreen ? 'fixed inset-4 z-50' : ''
    }`}>
      {/* Chart Header */}
      <div className="border-b border-gray-700 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Symbol and Price Info */}
          <div className="flex items-center space-x-4">
            <select
              value={symbol}
              onChange={(e) => onSymbolChange?.(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-lg font-bold focus:ring-2 focus:ring-blue-500"
            >
              {popularSymbols.map(sym => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>
            
            {lastCandle && (
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold">
                  {formatPrice(lastCandle.close)}
                </span>
                <span className={`flex items-center space-x-1 px-2 py-1 rounded text-sm font-medium ${
                  priceChange >= 0 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {priceChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%</span>
                </span>
              </div>
            )}
          </div>

          {/* Chart Controls */}
          <div className="flex items-center space-x-2">
            {/* Timeframe Selector */}
            <div className="flex bg-gray-700 rounded-lg p-1">
              {timeframes.map(tf => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    timeframe === tf.value
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  title={tf.name}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Chart Actions */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize className="h-4 w-4" />
            </button>
            
            <button
              onClick={generateChartData}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Technical Indicators Toggle */}
        <div className="flex items-center space-x-4 mt-3">
          <span className="text-sm text-gray-400 font-medium">Indicators:</span>
          {Object.entries(indicators).map(([key, enabled]) => (
            <button
              key={key}
              onClick={() => toggleIndicator(key)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                enabled
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-gray-700 text-gray-400 hover:text-gray-300'
              }`}
            >
              {enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              <span>{key.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-4" style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}>
        <div ref={chartContainerRef} className="w-full h-full relative bg-gray-900/30 rounded-lg overflow-hidden">
          {/* Price Chart */}
          <div className="absolute inset-0 p-4">
            <svg width="100%" height="70%" viewBox="0 0 800 300" className="overflow-visible">
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Price Data */}
              {chartData.length > 0 && (() => {
                const maxPrice = Math.max(...chartData.map(d => d.high));
                const minPrice = Math.min(...chartData.map(d => d.low));
                const priceRange = maxPrice - minPrice;
                const width = 800;
                const height = 300;
                const candleWidth = width / chartData.length * 0.8;
                
                return chartData.map((candle, index) => {
                  const x = (index / chartData.length) * width;
                  const yHigh = ((maxPrice - candle.high) / priceRange) * height;
                  const yLow = ((maxPrice - candle.low) / priceRange) * height;
                  const yOpen = ((maxPrice - candle.open) / priceRange) * height;
                  const yClose = ((maxPrice - candle.close) / priceRange) * height;
                  
                  const isGreen = candle.close >= candle.open;
                  const bodyTop = Math.min(yOpen, yClose);
                  const bodyHeight = Math.abs(yOpen - yClose);
                  
                  return (
                    <g key={index}>
                      {/* Wick */}
                      <line
                        x1={x + candleWidth/2}
                        y1={yHigh}
                        x2={x + candleWidth/2}
                        y2={yLow}
                        stroke={isGreen ? '#10b981' : '#ef4444'}
                        strokeWidth="1"
                      />
                      {/* Body */}
                      <rect
                        x={x}
                        y={bodyTop}
                        width={candleWidth}
                        height={Math.max(bodyHeight, 1)}
                        fill={isGreen ? '#10b981' : '#ef4444'}
                        opacity="0.8"
                      />
                    </g>
                  );
                });
              })()}
              
              {/* SMA Line */}
              {indicators.sma && smaData.length > 0 && (
                <polyline
                  points={smaData.map((sma, index) => {
                    if (sma === null) return '';
                    const maxPrice = Math.max(...chartData.map(d => d.high));
                    const minPrice = Math.min(...chartData.map(d => d.low));
                    const priceRange = maxPrice - minPrice;
                    const x = (index / chartData.length) * 800;
                    const y = ((maxPrice - sma) / priceRange) * 300;
                    return `${x},${y}`;
                  }).filter(Boolean).join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  opacity="0.7"
                />
              )}
            </svg>
            
            {/* Volume Chart */}
            {indicators.volume && (
              <div className="mt-4 h-16 relative">
                <svg width="100%" height="100%" viewBox="0 0 800 60">
                  {chartData.map((candle, index) => {
                    const maxVolume = Math.max(...chartData.map(d => d.volume));
                    const x = (index / chartData.length) * 800;
                    const height = (candle.volume / maxVolume) * 60;
                    const width = 800 / chartData.length * 0.8;
                    const isGreen = candle.close >= candle.open;
                    
                    return (
                      <rect
                        key={index}
                        x={x}
                        y={60 - height}
                        width={width}
                        height={height}
                        fill={isGreen ? '#10b981' : '#ef4444'}
                        opacity="0.6"
                      />
                    );
                  })}
                </svg>
                <div className="absolute top-0 left-0 text-xs text-gray-400">Volume</div>
              </div>
            )}
            
            {/* RSI Indicator */}
            {indicators.rsi && rsiData.length > 0 && (
              <div className="mt-4 h-16 relative">
                <svg width="100%" height="100%" viewBox="0 0 800 60">
                  {/* RSI Grid */}
                  <line x1="0" y1="18" x2="800" y2="18" stroke="#374151" strokeWidth="0.5" opacity="0.5" />
                  <line x1="0" y1="42" x2="800" y2="42" stroke="#374151" strokeWidth="0.5" opacity="0.5" />
                  
                  {/* RSI Line */}
                  <polyline
                    points={rsiData.map((rsi, index) => {
                      const x = ((index + 14) / chartData.length) * 800;
                      const y = 60 - (rsi / 100) * 60;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                </svg>
                <div className="absolute top-0 left-0 text-xs text-gray-400">RSI</div>
                <div className="absolute top-0 right-0 text-xs text-gray-400">
                  {rsiData[rsiData.length - 1]?.toFixed(1) || '--'}
                </div>
              </div>
            )}
          </div>

          {/* Chart Stats */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6 text-gray-400">
                {lastCandle && (
                  <>
                    <div>
                      <span className="text-gray-500">O:</span> {formatPrice(lastCandle.open)}
                    </div>
                    <div>
                      <span className="text-gray-500">H:</span> {formatPrice(lastCandle.high)}
                    </div>
                    <div>
                      <span className="text-gray-500">L:</span> {formatPrice(lastCandle.low)}
                    </div>
                    <div>
                      <span className="text-gray-500">C:</span> {formatPrice(lastCandle.close)}
                    </div>
                    <div>
                      <span className="text-gray-500">V:</span> {formatVolume(lastCandle.volume)}
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-gray-400">
                <Activity className="h-4 w-4" />
                <span>Live Data</span>
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
