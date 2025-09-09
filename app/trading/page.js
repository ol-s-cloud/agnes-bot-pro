'use client';

import React, { useState } from 'react';
import TradingDashboard from '../../components/trading/TradingDashboard';
import OrderPlacementInterface from '../../components/trading/OrderPlacementInterface';

export default function TradingPage() {
  const [selectedExchange, setSelectedExchange] = useState('binance');
  const [marketData, setMarketData] = useState({});
  const [accountBalance, setAccountBalance] = useState(10000);
  const [recentOrders, setRecentOrders] = useState([]);

  const handleOrderPlaced = (orderData) => {
    // Add to recent orders
    setRecentOrders(prev => [orderData, ...prev.slice(0, 9)]); // Keep last 10 orders
    
    // Update balance (demo calculation)
    if (orderData.side === 'buy') {
      setAccountBalance(prev => prev - (orderData.quantity * orderData.price || 0));
    }
    
    console.log('Order placed:', orderData);
  };

  const handleMarketDataUpdate = (newMarketData) => {
    setMarketData(newMarketData);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 p-6">
        {/* Main Dashboard - Takes up 3 columns */}
        <div className="xl:col-span-3">
          <TradingDashboard 
            selectedExchange={selectedExchange}
            onExchangeChange={setSelectedExchange}
            onMarketDataUpdate={handleMarketDataUpdate}
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
    </div>
  );
}
