'use client';

import React, { useState } from 'react';
import { 
  Save, Play, Pause, Settings, Brain, Target, TrendingUp, BarChart3, 
  Plus, Minus, Copy, Trash2, Eye, EyeOff, RefreshCw, AlertTriangle,
  CheckCircle, Info, Zap, Code, Layers, Filter, Search, Download,
  Upload, BookOpen, HelpCircle, PlusCircle, Edit3, ArrowRight, ArrowLeft
} from 'lucide-react';

const StrategyBuilder = () => {
  const [activeTab, setActiveTab] = useState('visual');
  const [strategy, setStrategy] = useState({
    name: 'ICT Scalping Pro V2',
    description: 'Advanced ICT concepts with FVG, Order Blocks, and Smart Money Structure',
    type: 'scalping',
    timeframes: ['1m', '5m'],
    instruments: ['ES', 'NQ', 'YM'],
    isActive: false,
    backtestResults: null
  });

  const [indicators, setIndicators] = useState([
    { id: 'ema_fast', type: 'EMA', period: 10, color: '#3B82F6', enabled: true },
    { id: 'ema_slow', type: 'EMA', period: 50, color: '#EF4444', enabled: true },
    { id: 'rsi', type: 'RSI', period: 14, color: '#8B5CF6', enabled: true }
  ]);

  const [riskSettings, setRiskSettings] = useState({
    accountRisk: 1.0,
    maxPositionSize: 3,
    stopLossPoints: 20,
    takeProfitPoints: 40,
    trailStop: true,
    trailDistance: 15,
    maxDailyLoss: 500,
    maxDailyTrades: 10
  });

  const strategyTemplates = [
    {
      id: 'ict_pro',
      name: 'ICT Pro Strategy',
      description: 'Inner Circle Trader concepts with FVG and Order Blocks',
      type: 'scalping',
      complexity: 'Advanced'
    },
    {
      id: 'ema_cross',
      name: 'EMA Crossover',
      description: 'Simple moving average crossover strategy',
      type: 'trend',
      complexity: 'Beginner'
    }
  ];

  const TabButton = ({ id, label, icon: Icon, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        active ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  const renderVisualBuilder = () => (
    <div className="space-y-6">
      {/* Strategy Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Strategy Name</label>
            <input
              type="text"
              value={strategy.name}
              onChange={(e) => setStrategy({...strategy, name: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Strategy Type</label>
            <select
              value={strategy.type}
              onChange={(e) => setStrategy({...strategy, type: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
            >
              <option value="scalping">Scalping</option>
              <option value="swing">Swing Trading</option>
              <option value="trend">Trend Following</option>
              <option value="mean_reversion">Mean Reversion</option>
              <option value="breakout">Breakout</option>
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm text-slate-400 mb-2">Description</label>
            <textarea
              value={strategy.description}
              onChange={(e) => setStrategy({...strategy, description: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 h-20 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Indicators */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Technical Indicators</h3>
              <button className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">
                <Plus className="w-4 h-4" />
                Add Indicator
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {indicators.map((indicator) => (
              <div key={indicator.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: indicator.color }}
                    />
                    <span className="font-medium">{indicator.type}</span>
                  </div>
                  <span className="text-slate-400">({indicator.period})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1 hover:bg-slate-700 rounded">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:bg-slate-700 rounded text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Management */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-lg font-semibold">Risk Management</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Account Risk (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={riskSettings.accountRisk}
                  onChange={(e) => setRiskSettings({...riskSettings, accountRisk: parseFloat(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Max Position Size</label>
                <input
                  type="number"
                  value={riskSettings.maxPositionSize}
                  onChange={(e) => setRiskSettings({...riskSettings, maxPositionSize: parseInt(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Stop Loss (Points)</label>
                <input
                  type="number"
                  value={riskSettings.stopLossPoints}
                  onChange={(e) => setRiskSettings({...riskSettings, stopLossPoints: parseInt(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Take Profit (Points)</label>
                <input
                  type="number"
                  value={riskSettings.takeProfitPoints}
                  onChange={(e) => setRiskSettings({...riskSettings, takeProfitPoints: parseInt(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-slate-400">Trailing Stop:</span>
              <button
                onClick={() => setRiskSettings({...riskSettings, trailStop: !riskSettings.trailStop})}
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  riskSettings.trailStop ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}
              >
                {riskSettings.trailStop ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Strategy Templates</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search templates..."
              className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {strategyTemplates.map((template) => (
          <div key={template.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-lg">{template.name}</h4>
                <p className="text-sm text-slate-400 mt-1">{template.description}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                template.complexity === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                template.complexity === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {template.complexity}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Type:</span>
                <span className="capitalize">{template.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Timeframe:</span>
                <span>5m, 15m</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Instruments:</span>
                <span>ES, NQ, YM</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors">
                <Copy className="w-4 h-4" />
                Use Template
              </button>
              <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-slate-800 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Strategy Builder</h1>
              <p className="text-slate-400 mt-1">Create, test, and deploy advanced trading strategies</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors">
              <Save className="w-4 h-4" />
              Save Strategy
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
              <Play className="w-4 h-4" />
              Deploy Live
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <TabButton id="visual" label="Visual Builder" icon={Layers} active={activeTab === 'visual'} />
          <TabButton id="code" label="Code Editor" icon={Code} active={activeTab === 'code'} />
          <TabButton id="backtest" label="Backtest" icon={BarChart3} active={activeTab === 'backtest'} />
          <TabButton id="templates" label="Templates" icon={BookOpen} active={activeTab === 'templates'} />
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'visual' && renderVisualBuilder()}
          {activeTab === 'code' && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Code Editor</h3>
              <div className="bg-slate-900 rounded-lg p-4">
                <pre className="text-sm text-slate-300">
                  {`// Strategy code editor coming soon...
// Write your custom trading algorithms here

class CustomStrategy {
  constructor(config) {
    this.config = config;
    // Initialize your strategy
  }

  onTick(data) {
    // Your trading logic here
  }
}`}
                </pre>
              </div>
            </div>
          )}
          {activeTab === 'backtest' && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Backtest Results</h3>
              <div className="text-center text-slate-400 py-12">
                <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                <p>Run a backtest to see historical performance</p>
                <button className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors">
                  Start Backtest
                </button>
              </div>
            </div>
          )}
          {activeTab === 'templates' && renderTemplates()}
        </div>
      </div>
    </div>
  );
};

export default StrategyBuilder;
