'use client';

import React, { useState } from 'react';
import TradingDashboard from '../../components/trading/TradingDashboard';
import OrderPlacementInterface from '../../components/trading/OrderPlacementInterface';
import TradingChart from '../../components/trading/TradingChart';
import TradeHistoryAnalytics from '../../components/trading/TradeHistoryAnalytics';
import Navigation from '../../components/layout/Navigation';

export default function TradingPage() {
  const [selectedExchange, setSelectedExchange] = useState('binance');
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [marketData, setMarketData] = useState({});
  const [accountBalance, setAccountBalance] = useState(10000);
  const [recentOrders, setRecentOrders] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  const handleOrderPlaced = (orderData) => {
    // Add to recent orders
    setRecentOrders(prev => [orderData, ...prev.slice(0, 9)]); // Keep last 10 orders
    
    // Update balance (demo calculation)
    if (orderData.side === 'buy') {
      setAccountBalance(prev => prev - (orderData.quantity * orderData.price || 0));
    }
    
    // Trigger refresh of analytics
    setRefreshTrigger(prev => prev + 1);
    
    console.log('Order placed:', orderData);
  };

  const handleMarketDataUpdate = (newMarketData) => {
    setMarketData(newMarketData);
  };

  const handleSymbolChange = (symbol) => {
    setSelectedSymbol(symbol);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', description: 'Dashboard & Trading' },
    { id: 'chart', name: 'Advanced Chart', description: 'Technical Analysis' },
    { id: 'history', name: 'Trade History', description: 'Analytics & P&L' }
  ];

  const currentMarketPrice = marketData[selectedSymbol]?.price || 50000;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-800 bg-gray-800/50">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <div>
                  <div>{tab.name}</div>
                  <div className="text-xs text-gray-500">{tab.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Dashboard - Takes up 3 columns */}
            <div className="xl:col-span-3">
              <TradingDashboard 
                selectedExchange={selectedExchange}
                onExchangeChange={setSelectedExchange}
                onMarketDataUpdate={handleMarketDataUpdate}
                onSymbolChange={handleSymbolChange}
              />
            </div>
            
            {/* Order Placement Sidebar - Takes up 1 column */}
            <div className="xl:col-span-1">
              <div className="sticky top-6 space-y-6">
                <OrderPlacementInterface
                  selectedExchange={selectedExchange}
                  currentMarketData={marketData}
                  onOrderPlaced={handleOrderPlaced}
                  accountBalance={accountBalance}
                />
                
                {/* Recent Orders */}
                {recentOrders.length > 0 && (
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
                    <div className="space-y-3">
                      {recentOrders.map((order, index) => (
                        <div key={index} className="bg-gray-700/30 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">
                                {order.side?.toUpperCase()} {order.symbol}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(order.transactTime || Date.now()).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {order.quantity}
                              </p>
                              <p className={`text-xs ${
                                order.side === 'buy' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {order.status || 'FILLED'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chart' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Advanced Chart - Takes up 3 columns */}
            <div className="xl:col-span-3">
              <TradingChart
                symbol={selectedSymbol}
                exchange={selectedExchange}
                onSymbolChange={handleSymbolChange}
                currentPrice={currentMarketPrice}
                height={600}
              />
            </div>
            
            {/* Chart Controls & Order Interface */}
            <div className="xl:col-span-1">
              <div className="sticky top-6 space-y-6">
                {/* Quick Trading */}
                <OrderPlacementInterface
                  selectedExchange={selectedExchange}
                  currentMarketData={marketData}
                  onOrderPlaced={handleOrderPlaced}
                  accountBalance={accountBalance}
                />
                
                {/* Market Stats */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">Market Stats</h3>
                  <div className="space-y-3">
                    {Object.entries(marketData).slice(0, 4).map(([symbol, data]) => {
                      const priceChange = parseFloat(data?.priceChangePercent || (Math.random() * 10 - 5));
                      const isPositive = priceChange >= 0;
                      
                      return (
                        <div key={symbol} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{symbol}</p>
                            <p className="text-xs text-gray-400">
                              ${parseFloat(data?.price || (45000 + Math.random() * 10000)).toFixed(2)}
                            </p>
                          </div>
                          <p className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-8">
            <TradeHistoryAnalytics
              selectedExchange={selectedExchange}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}
      </div>
    </div>
  );
}
