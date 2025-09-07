/**
 * Unified Trading Dashboard
 * Central hub for all trading activities across multiple platforms
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  CogIcon,
  PlayIcon,
  PauseIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const UnifiedTradingDashboard = () => {
  const [isDemo, setIsDemo] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('binance');
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [activeStrategies, setActiveStrategies] = useState([]);
  const [platformStatus, setPlatformStatus] = useState({});
  const [accountBalances, setAccountBalances] = useState({});
  const [activePositions, setActivePositions] = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [marketOverview, setMarketOverview] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // Trading manager reference
  const tradingManagerRef = useRef(null);
  
  // Available platforms and symbols
  const platforms = {
    traditional: [
      { id: 'tradovate', name: 'Tradovate', symbols: ['ESZ1', 'NQZ1', 'YMZ1', 'RTY'] },
      { id: 'ninjatrader', name: 'NinjaTrader', symbols: ['ES', 'NQ', 'YM', 'RTY'] }
    ],
    crypto: [
      { id: 'binance', name: 'Binance', symbols: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT'] },
      { id: 'bybit', name: 'Bybit', symbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT'] }
    ]
  };
  
  useEffect(() => {
    initializeTradingManager();
    
    // Setup periodic updates
    const updateInterval = setInterval(() => {
      updateDashboardData();
    }, 5000);
    
    return () => {
      clearInterval(updateInterval);
      if (tradingManagerRef.current) {
        tradingManagerRef.current.disconnectAll();
      }
    };
  }, []);
  
  const initializeTradingManager = async () => {
    try {
      // Simulate initialization for demo
      console.log('Initializing trading manager...');
      setIsConnected(true);
      
      // Mock platform status
      setPlatformStatus({
        binance: { connected: true, mode: isDemo ? 'demo' : 'live' },
        bybit: { connected: true, mode: isDemo ? 'demo' : 'live' }
      });
      
      // Mock account balances
      setAccountBalances({
        binance: {
          totalValue: 10000,
          availableBalance: 8500,
          unrealizedPnl: 150.25
        },
        bybit: {
          totalValue: 5000,
          availableBalance: 4200,
          unrealizedPnl: -25.50
        }
      });
      
      addNotification('success', 'Connected to trading platforms successfully');
      
    } catch (error) {
      console.error('Failed to initialize trading manager:', error);
      addNotification('error', 'Failed to initialize trading system');
    }
  };
  
  const handleModeSwitch = async () => {
    try {
      const newMode = !isDemo;
      setIsDemo(newMode);
      
      // Update platform status
      setPlatformStatus(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(platform => {
          updated[platform].mode = newMode ? 'demo' : 'live';
        });
        return updated;
      });
      
      addNotification('success', `Switched to ${newMode ? 'DEMO' : 'LIVE'} mode`);
    } catch (error) {
      addNotification('error', `Mode switch failed: ${error.message}`);
    }
  };
  
  const updateDashboardData = async () => {
    // Simulate data updates
    console.log('Updating dashboard data...');
  };
  
  const placeOrder = async (orderData) => {
    try {
      // Simulate order placement
      console.log('Placing order:', orderData);
      addNotification('success', `Order placed: ${orderData.symbol}`);
      
      // Add mock order to open orders
      const mockOrder = {
        orderId: `order_${Date.now()}`,
        symbol: orderData.symbol,
        side: orderData.side,
        quantity: orderData.quantity,
        type: orderData.type,
        price: orderData.price,
        status: 'pending'
      };
      
      setOpenOrders(prev => [mockOrder, ...prev]);
      
      return mockOrder;
    } catch (error) {
      addNotification('error', `Order failed: ${error.message}`);
      throw error;
    }
  };
  
  const cancelOrder = async (orderId) => {
    try {
      // Remove order from list
      setOpenOrders(prev => prev.filter(order => order.orderId !== orderId));
      addNotification('success', 'Order cancelled');
    } catch (error) {
      addNotification('error', `Cancel failed: ${error.message}`);
    }
  };
  
  const addNotification = (type, message) => {
    const notification = {
      id: Date.now(),
      type: type,
      message: message,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default: return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Agnes Bot Pro v2.0.0</h1>
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Demo/Live Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm">Mode:</span>
              <button
                onClick={handleModeSwitch}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  isDemo 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-red-600 text-white'
                }`}
              >
                {isDemo ? 'DEMO' : 'LIVE'}
              </button>
            </div>
            
            {/* Platform Selector */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
            >
              <optgroup label="Traditional">
                {platforms.traditional.map(platform => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Crypto">
                {platforms.crypto.map(platform => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </optgroup>
            </select>
            
            {/* Symbol Selector */}
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
            >
              {[...platforms.traditional, ...platforms.crypto]
                .find(p => p.id === selectedPlatform)?.symbols.map(symbol => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar - Account Info */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 space-y-6">
          {/* Account Balance */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              Account Balance
            </h3>
            <div className="space-y-2">
              {Object.entries(accountBalances).map(([platform, balance]) => (
                <div key={platform} className="bg-gray-700 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">
                      {platform}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      platformStatus[platform]?.connected 
                        ? 'bg-green-600' 
                        : 'bg-red-600'
                    }`}>
                      {platformStatus[platform]?.mode || 'offline'}
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="text-xl font-bold">
                      ${balance.totalValue?.toLocaleString() || '0.00'}
                    </div>
                    <div className="text-sm text-gray-400">
                      Available: ${balance.availableBalance?.toLocaleString() || '0.00'}
                    </div>
                    {balance.unrealizedPnl !== undefined && (
                      <div className={`text-sm ${
                        balance.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        P&L: ${balance.unrealizedPnl.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Open Orders */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Open Orders</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {openOrders.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-4">
                  No open orders
                </div>
              ) : (
                openOrders.map((order, index) => (
                  <div key={index} className="bg-gray-700 p-3 rounded text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{order.symbol}</span>
                      <button
                        onClick={() => cancelOrder(order.orderId)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="flex justify-between">
                      <span>{order.side} {order.quantity}</span>
                      <span>{order.type}</span>
                    </div>
                    {order.price && (
                      <div className="text-gray-400">
                        Price: ${order.price}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Center - Chart Placeholder */}
        <div className="flex-1 p-4">
          <div className="bg-gray-800 rounded-lg h-[600px] flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <div className="text-gray-400 text-lg">Real-Time Chart</div>
              <div className="text-sm text-gray-500 mt-2">
                {selectedSymbol} on {selectedPlatform}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar - Trading Panel */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 space-y-6">
          <QuickTradePanel
            symbol={selectedSymbol}
            platform={selectedPlatform}
            onPlaceOrder={placeOrder}
          />
        </div>
      </div>
      
      {/* Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg max-w-sm"
          >
            <div className="flex items-center space-x-2">
              {getNotificationIcon(notification.type)}
              <div className="flex-1">
                <div className="text-sm font-medium">{notification.message}</div>
                <div className="text-xs text-gray-400">{notification.timestamp}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Quick Trade Panel Component
const QuickTradePanel = ({ symbol, platform, onPlaceOrder }) => {
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quantity || (orderType === 'limit' && !price)) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const orderData = {
        symbol: symbol,
        side: side,
        type: orderType,
        quantity: parseFloat(quantity)
      };
      
      if (orderType === 'limit') {
        orderData.price = parseFloat(price);
      }
      
      await onPlaceOrder(orderData);
      
      // Reset form
      setQuantity('');
      setPrice('');
    } catch (error) {
      console.error('Order failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Quick Trade</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Order Type</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
        </div>
        
        {/* Side */}
        <div>
          <label className="block text-sm font-medium mb-1">Side</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSide('buy')}
              className={`py-2 px-3 rounded text-sm font-medium ${
                side === 'buy' ? 'bg-green-600' : 'bg-gray-700'
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setSide('sell')}
              className={`py-2 px-3 rounded text-sm font-medium ${
                side === 'sell' ? 'bg-red-600' : 'bg-gray-700'
              }`}
            >
              Sell
            </button>
          </div>
        </div>
        
        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <input
            type="number"
            step="0.001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            placeholder="0.001"
          />
        </div>
        
        {/* Price (for limit orders) */}
        {orderType === 'limit' && (
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              placeholder="0.00"
            />
          </div>
        )}
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded font-medium ${
            side === 'buy'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? 'Placing...' : `${side.toUpperCase()} ${symbol}`}
        </button>
      </form>
      
      {/* Demo Notice */}
      <div className="mt-4 p-3 bg-blue-900/50 border border-blue-600 rounded">
        <div className="text-xs text-blue-300">
          🛡️ Demo Mode Active - Virtual Trading Only
        </div>
      </div>
    </div>
  );
};

export default UnifiedTradingDashboard;