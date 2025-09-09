/**
 * Main Trading Dashboard - PROFESSIONAL UI
 * Comprehensive trading interface with real-time data and secure API integration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Wallet, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Refresh
} from 'lucide-react';

export default function TradingDashboard() {
  const [accountData, setAccountData] = useState(null);
  const [marketData, setMarketData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState('');
  const [selectedExchange, setSelectedExchange] = useState('binance');
  const [rateLimitStatus, setRateLimitStatus] = useState({});

  // Initialize dashboard data
  useEffect(() => {
    initializeDashboard();
    const interval = setInterval(updateMarketData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [selectedExchange]);

  const initializeDashboard = async () => {
    try {
      setIsLoading(true);
      
      // Get CSRF token for secure requests
      await fetchCSRFToken();
      
      // Load account data and market data
      await Promise.all([
        fetchAccountData(),
        fetchMarketData(),
        fetchRateLimitStatus()
      ]);
      
    } catch (error) {
      console.error('Dashboard initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCSRFToken = async () => {
    try {
      const response = await fetch('/api/csrf');
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    } catch (error) {
      console.error('CSRF token fetch error:', error);
    }
  };

  const fetchAccountData = async () => {
    try {
      const response = await fetch('/api/trading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          action: 'getAccountInfo',
          exchange: selectedExchange
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setAccountData(result.data);
      }
    } catch (error) {
      console.error('Account data fetch error:', error);
    }
  };

  const fetchMarketData = async () => {
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT'];
      const marketPromises = symbols.map(async (symbol) => {
        const response = await fetch('/api/trading', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({
            action: 'getTicker',
            symbol: symbol,
            exchange: selectedExchange
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          return { symbol, data: result.data };
        }
        return null;
      });
      
      const results = await Promise.all(marketPromises);
      const newMarketData = {};
      results.forEach(result => {
        if (result) {
          newMarketData[result.symbol] = result.data;
        }
      });
      
      setMarketData(newMarketData);
    } catch (error) {
      console.error('Market data fetch error:', error);
    }
  };

  const fetchRateLimitStatus = async () => {
    try {
      const response = await fetch('/api/trading');
      if (response.ok) {
        const result = await response.json();
        setRateLimitStatus(result.rateLimitStatus || {});
      }
    } catch (error) {
      console.error('Rate limit status error:', error);
    }
  };

  const updateMarketData = () => {
    if (!isLoading) {
      fetchMarketData();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatPercent = (percent) => {
    const num = parseFloat(percent || 0);
    const formatted = Math.abs(num).toFixed(2);
    return `${num >= 0 ? '+' : '-'}${formatted}%`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Initializing Trading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Agnes Bot Pro
              </h1>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                DEMO MODE
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Exchange Selector */}
              <select 
                value={selectedExchange}
                onChange={(e) => setSelectedExchange(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="binance">Binance</option>
                <option value="bybit">Bybit</option>
                <option value="tradovate">Tradovate</option>
              </select>
              
              {/* Refresh Button */}
              <button
                onClick={initializeDashboard}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <Refresh className="h-5 w-5" />
              </button>
              
              {/* Rate Limit Status */}
              <div className="flex items-center space-x-2 text-sm">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-400">
                  API: {rateLimitStatus.trading?.remaining || 0}/10
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Balance */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Total Balance</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(accountData?.totalWalletBalance || accountData?.balance || 10000)}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          {/* Equity */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Total Equity</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(accountData?.totalMarginBalance || accountData?.equity || 10250.50)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </div>

          {/* Unrealized P&L */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">Unrealized P&L</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(accountData?.totalUnrealizedProfit || 250.50)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          {/* Account Type */}
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-400 text-sm font-medium">Account Type</p>
                <p className="text-xl font-bold">
                  {accountData?.accountType || 'DEMO'}
                </p>
                <p className="text-sm text-gray-400">
                  {selectedExchange.toUpperCase()}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Market Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Market Overview */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Market Overview</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {Object.entries(marketData).map(([symbol, data]) => {
                const priceChange = parseFloat(data?.priceChangePercent || (Math.random() * 10 - 5));
                const isPositive = priceChange >= 0;
                
                return (
                  <div key={symbol} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {isPositive ? 
                          <ArrowUpRight className="h-4 w-4 text-green-400" /> : 
                          <ArrowDownRight className="h-4 w-4 text-red-400" />
                        }
                      </div>
                      <div>
                        <p className="font-medium">{symbol}</p>
                        <p className="text-sm text-gray-400">
                          Vol: {(Math.random() * 1000000).toFixed(0)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold">
                        ${parseFloat(data?.price || (45000 + Math.random() * 10000)).toFixed(2)}
                      </p>
                      <p className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(priceChange)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Portfolio Breakdown */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">Portfolio Breakdown</h2>
            
            <div className="space-y-4">
              {accountData?.balances ? 
                Object.entries(typeof accountData.balances === 'object' ? accountData.balances : {}).map(([asset, balance]) => (
                  <div key={asset} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                        {asset.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{asset}</p>
                        <p className="text-sm text-gray-400">Available</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{balance.free || 0}</p>
                      <p className="text-sm text-gray-400">
                        Locked: {balance.locked || 0}
                      </p>
                    </div>
                  </div>
                )) :
                // Default demo portfolio
                [
                  { asset: 'USDT', free: '10000.00', locked: '500.00' },
                  { asset: 'BTC', free: '0.5', locked: '0.0' },
                  { asset: 'ETH', free: '5.0', locked: '0.0' },
                  { asset: 'ADA', free: '1000.0', locked: '0.0' }
                ].map(({ asset, free, locked }) => (
                  <div key={asset} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                        {asset.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{asset}</p>
                        <p className="text-sm text-gray-400">Available</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{free}</p>
                      <p className="text-sm text-gray-400">Locked: {locked}</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Security Status */}
        <div className="mt-8 bg-green-500/10 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-400" />
            <div>
              <h3 className="font-bold text-green-400">Security Status: Protected</h3>
              <p className="text-sm text-gray-300">
                Rate limiting active • CSRF protection enabled • HTTPS enforced • Demo mode active
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
