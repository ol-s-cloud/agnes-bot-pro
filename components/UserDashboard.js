'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Square, Settings, Brain, Target, Shield, Zap, TrendingUp, 
  Database, Activity, AlertTriangle, CheckCircle2, XCircle, Cpu, BarChart3, 
  Clock, Globe, TrendingDown, Wifi, WifiOff, Link, Unlink, User, CreditCard,
  PlusCircle, Edit3, Trash2, Eye, EyeOff, RefreshCw, Bell, DollarSign,
  Briefcase, PieChart, LineChart, MoreVertical, Search, Filter, Menu, X
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

const UserDashboard = () => {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('overview');

  // Mock data - in production, this would come from your API
  const [user, setUser] = useState({
    name: session?.user?.name || 'Trading User',
    email: session?.user?.email || 'user@example.com',
    subscription: 'Professional',
    memberSince: '2024-01-15'
  });

  const [accounts, setAccounts] = useState([
    {
      id: 'apex_001',
      provider: 'APEX',
      accountId: 'AP-789456',
      status: 'connected',
      balance: 48750.00,
      equity: 52340.75,
      dayPnL: 1240.50,
      isActive: true
    },
    {
      id: 'nt_001', 
      provider: 'NINJATRADER',
      accountId: 'NT-123789',
      status: 'connected',
      balance: 25000.00,
      equity: 26485.25,
      dayPnL: -345.80,
      isActive: true
    }
  ]);

  const [bots, setBots] = useState([
    {
      id: 'bot_001',
      name: 'ICT Scalper Pro',
      strategy: 'ICT Strategy',
      account: 'AP-789456',
      status: 'running',
      pnl: 847.25,
      trades: 23,
      winRate: 78.3,
      uptime: '2d 14h'
    },
    {
      id: 'bot_002',
      name: 'Swing Master',
      strategy: 'Swing Trading',
      account: 'NT-123789',
      status: 'stopped',
      pnl: -125.50,
      trades: 8,
      winRate: 62.5,
      uptime: '0h'
    }
  ]);

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'terminal', label: 'Trading Terminal', icon: Activity },
    { id: 'bots', label: 'Bot Manager', icon: Brain },
    { id: 'strategies', label: 'Strategies', icon: Target },
    { id: 'accounts', label: 'Accounts', icon: CreditCard },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const StatusBadge = ({ status, size = 'normal' }) => {
    const configs = {
      running: { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' },
      stopped: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
      connected: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
      disconnected: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
      paused: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' }
    };
    
    const config = configs[status] || configs.stopped;
    const sizeClass = size === 'small' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
    
    return (
      <span className={`${sizeClass} rounded-full font-semibold border ${config.bg} ${config.color} ${config.border}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total P&L</p>
              <p className="text-2xl font-bold text-green-400">+$3,247.85</p>
              <p className="text-xs text-emerald-500">+12.4% this week</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Bots</p>
              <p className="text-2xl font-bold text-blue-400">{bots.filter(b => b.status === 'running').length}</p>
              <p className="text-xs text-slate-500">of {bots.length} total</p>
            </div>
            <Brain className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Win Rate</p>
              <p className="text-2xl font-bold text-purple-400">78.5%</p>
              <p className="text-xs text-purple-500">Last 7 days</p>
            </div>
            <Target className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Trades</p>
              <p className="text-2xl font-bold text-orange-400">892</p>
              <p className="text-xs text-orange-500">+45 today</p>
            </div>
            <Activity className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-lg font-semibold">Connected Accounts</h3>
          </div>
          <div className="p-6 space-y-4">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${account.status === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <div>
                    <p className="font-medium">{account.provider}</p>
                    <p className="text-sm text-slate-400">{account.accountId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${account.balance.toLocaleString()}</p>
                  <p className={`text-sm ${account.dayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {account.dayPnL >= 0 ? '+' : ''}${account.dayPnL.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-lg font-semibold">Active Bots</h3>
          </div>
          <div className="p-6 space-y-4">
            {bots.map((bot) => (
              <div key={bot.id} className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <StatusBadge status={bot.status} />
                  <div>
                    <p className="font-medium">{bot.name}</p>
                    <p className="text-sm text-slate-400">{bot.strategy}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${bot.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {bot.pnl >= 0 ? '+' : ''}${bot.pnl.toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-400">{bot.winRate}% WR</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return renderOverview();
      case 'strategies':
        return (
          <div className="text-center p-8">
            <Target className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Strategy Builder</h3>
            <p className="text-slate-400 mb-6">Create and manage your trading strategies</p>
            <button 
              onClick={() => window.location.href = '/dashboard/strategy-builder'}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Open Strategy Builder
            </button>
          </div>
        );
      default:
        return (
          <div className="text-center text-slate-400 p-8">
            <h3 className="text-xl mb-2">{currentView.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
            <p>This section is coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold">Agnes Bot Pro</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-800 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.subscription}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              title="Sign Out"
            >
              <Database className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-800 rounded"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold capitalize">{currentView.replace('_', ' ')}</h1>
                <p className="text-sm text-slate-400">
                  {currentView === 'overview' && 'Welcome back! Here\'s your trading overview.'}
                  {currentView === 'bots' && 'Manage your automated trading bots'}
                  {currentView === 'strategies' && 'Create and manage trading strategies'}
                  {currentView === 'terminal' && 'Advanced trading interface'}
                  {currentView === 'accounts' && 'Connect and manage trading accounts'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-slate-800 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-slate-400">All systems operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default UserDashboard;
