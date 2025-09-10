/**
 * Trade History & Analytics Component - COMPREHENSIVE TRACKING
 * Advanced trade history with performance analytics and filtering
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Download,
  Search,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Target
} from 'lucide-react';

export default function TradeHistoryAnalytics({ 
  selectedExchange = 'binance',
  refreshTrigger = 0 
}) {
  const [tradeHistory, setTradeHistory] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [filters, setFilters] = useState({
    dateRange: '7d',
    status: 'all',
    symbol: 'all',
    side: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrade, setSelectedTrade] = useState(null);

  const dateRanges = [
    { value: '1d', label: 'Today' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'all', label: 'All Time' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'filled', label: 'Filled' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rejected', label: 'Rejected' }
  ];

  useEffect(() => {
    loadTradeHistory();
  }, [selectedExchange, filters, refreshTrigger]);

  useEffect(() => {
    calculateAnalytics();
  }, [tradeHistory]);

  const loadTradeHistory = () => {
    setIsLoading(true);
    
    // Generate demo trade history
    const demoTrades = generateDemoTrades();
    setTradeHistory(demoTrades);
    setIsLoading(false);
  };

  const generateDemoTrades = () => {
    const trades = [];
    const symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT', 'DOGEUSDT'];
    const statuses = ['filled', 'filled', 'filled', 'pending', 'cancelled'];
    const sides = ['buy', 'sell'];
    
    for (let i = 0; i < 50; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const side = sides[Math.floor(Math.random() * sides.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const price = 45000 + (Math.random() * 10000);
      const quantity = Math.random() * 2;
      const total = price * quantity;
      const fee = total * 0.001;
      
      const daysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));
      
      trades.push({
        id: `trade_${i + 1}`,
        orderId: `order_${Date.now()}_${i}`,
        symbol,
        side,
        type: Math.random() > 0.5 ? 'market' : 'limit',
        quantity: parseFloat(quantity.toFixed(6)),
        price: parseFloat(price.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        fee: parseFloat(fee.toFixed(4)),
        status,
        timestamp: timestamp.getTime(),
        exchange: selectedExchange,
        pnl: status === 'filled' ? (Math.random() - 0.5) * total * 0.1 : 0
      });
    }
    
    return trades.sort((a, b) => b.timestamp - a.timestamp);
  };

  const calculateAnalytics = () => {
    if (tradeHistory.length === 0) return;
    
    const filledTrades = tradeHistory.filter(trade => trade.status === 'filled');
    const totalTrades = filledTrades.length;
    const totalVolume = filledTrades.reduce((sum, trade) => sum + trade.total, 0);
    const totalFees = filledTrades.reduce((sum, trade) => sum + trade.fee, 0);
    const totalPnL = filledTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    
    const winningTrades = filledTrades.filter(trade => trade.pnl > 0);
    const losingTrades = filledTrades.filter(trade => trade.pnl < 0);
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, trade) => sum + trade.pnl, 0) / winningTrades.length 
      : 0;
    const avgLoss = losingTrades.length > 0 
      ? losingTrades.reduce((sum, trade) => sum + Math.abs(trade.pnl), 0) / losingTrades.length 
      : 0;
    
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
    
    // Symbol distribution
    const symbolStats = {};
    filledTrades.forEach(trade => {
      if (!symbolStats[trade.symbol]) {
        symbolStats[trade.symbol] = { count: 0, volume: 0, pnl: 0 };
      }
      symbolStats[trade.symbol].count++;
      symbolStats[trade.symbol].volume += trade.total;
      symbolStats[trade.symbol].pnl += trade.pnl;
    });
    
    setAnalytics({
      totalTrades,
      totalVolume,
      totalFees,
      totalPnL,
      winRate,
      avgWin,
      avgLoss,
      profitFactor,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      symbolStats
    });
  };

  const filteredTrades = tradeHistory.filter(trade => {
    // Date filter
    if (filters.dateRange !== 'all') {
      const daysAgo = parseInt(filters.dateRange.replace('d', ''));
      const cutoff = Date.now() - (daysAgo * 24 * 60 * 60 * 1000);
      if (trade.timestamp < cutoff) return false;
    }
    
    // Status filter
    if (filters.status !== 'all' && trade.status !== filters.status) return false;
    
    // Symbol filter
    if (filters.symbol !== 'all' && trade.symbol !== filters.symbol) return false;
    
    // Side filter
    if (filters.side !== 'all' && trade.side !== filters.side) return false;
    
    // Search filter
    if (searchTerm && !trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !trade.orderId.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'filled':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'cancelled':
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Symbol', 'Side', 'Type', 'Quantity', 'Price', 'Total', 'Fee', 'Status', 'P&L'];
    const csvData = [
      headers.join(','),
      ...filteredTrades.map(trade => [
        new Date(trade.timestamp).toISOString(),
        trade.symbol,
        trade.side,
        trade.type,
        trade.quantity,
        trade.price,
        trade.total,
        trade.fee,
        trade.status,
        trade.pnl
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `trade-history-${selectedExchange}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading trade history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total P&L */}
        <div className={`bg-gradient-to-br rounded-xl p-6 border ${
          analytics.totalPnL >= 0 
            ? 'from-green-500/10 to-green-600/10 border-green-500/20' 
            : 'from-red-500/10 to-red-600/10 border-red-500/20'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${analytics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                Total P&L
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(analytics.totalPnL || 0)}
              </p>
            </div>
            {analytics.totalPnL >= 0 ? 
              <TrendingUp className="h-8 w-8 text-green-400" /> : 
              <TrendingDown className="h-8 w-8 text-red-400" />
            }
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Win Rate</p>
              <p className="text-2xl font-bold">{analytics.winRate?.toFixed(1) || 0}%</p>
              <p className="text-xs text-gray-400">
                {analytics.winningTrades || 0}W / {analytics.losingTrades || 0}L
              </p>
            </div>
            <Target className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        {/* Total Volume */}
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Total Volume</p>
              <p className="text-2xl font-bold">{formatCurrency(analytics.totalVolume || 0)}</p>
              <p className="text-xs text-gray-400">
                {analytics.totalTrades || 0} trades
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        {/* Total Fees */}
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm font-medium">Total Fees</p>
              <p className="text-2xl font-bold">{formatCurrency(analytics.totalFees || 0)}</p>
              <p className="text-xs text-gray-400">
                Profit Factor: {analytics.profitFactor?.toFixed(2) || 0}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-gray-400" />
            <h2 className="text-xl font-bold">Trade History</h2>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
              {filteredTrades.length} trades
            </span>
          </div>
          
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search symbol or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date Range */}
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          {/* Symbol */}
          <select
            value={filters.symbol}
            onChange={(e) => setFilters(prev => ({ ...prev, symbol: e.target.value }))}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Symbols</option>
            {Object.keys(analytics.symbolStats || {}).map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>

          {/* Side */}
          <select
            value={filters.side}
            onChange={(e) => setFilters(prev => ({ ...prev, side: e.target.value }))}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sides</option>
            <option value="buy">Buy Only</option>
            <option value="sell">Sell Only</option>
          </select>
        </div>

        {/* Trade Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Symbol</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Side</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Quantity</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Price</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Total</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">P&L</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade) => (
                <tr key={trade.id} className="border-b border-gray-800 hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 px-4 text-sm">
                    <div>
                      <div className="font-medium">
                        {new Date(trade.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(trade.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium">{trade.symbol}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.side === 'buy' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">{trade.type.toUpperCase()}</td>
                  <td className="py-3 px-4 text-sm text-right font-mono">{trade.quantity}</td>
                  <td className="py-3 px-4 text-sm text-right font-mono">{formatCurrency(trade.price)}</td>
                  <td className="py-3 px-4 text-sm text-right font-mono">{formatCurrency(trade.total)}</td>
                  <td className="py-3 px-4 text-sm text-right font-mono">
                    <span className={trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {formatCurrency(trade.pnl)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {getStatusIcon(trade.status)}
                      <span className="text-xs capitalize">{trade.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedTrade(trade)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTrades.length === 0 && (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No trades found matching your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Trade Detail Modal */}
      {selectedTrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Trade Details</h3>
              <button
                onClick={() => setSelectedTrade(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Order ID:</span>
                <span className="font-mono">{selectedTrade.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Symbol:</span>
                <span className="font-medium">{selectedTrade.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Side:</span>
                <span className={`font-medium ${
                  selectedTrade.side === 'buy' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {selectedTrade.side.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total:</span>
                <span className="font-mono">{formatCurrency(selectedTrade.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">P&L:</span>
                <span className={`font-mono ${
                  selectedTrade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatCurrency(selectedTrade.pnl)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(selectedTrade.status)}
                  <span className="capitalize">{selectedTrade.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
