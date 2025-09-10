/**
 * Enhanced Home Page - PROFESSIONAL LANDING
 * Modern landing page showcasing Agnes Bot Pro features
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../components/layout/Navigation';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3, 
  Activity, 
  CheckCircle,
  ArrowRight,
  Play,
  Users,
  Globe,
  Lock,
  Cpu,
  DollarSign,
  Target
} from 'lucide-react';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Rotate feature highlights
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % 3);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'A+ security rating with HMAC authentication, rate limiting, and CSRF protection',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Real-time trading with advanced order types and instant execution',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive P&L tracking, trade history, and performance insights',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20'
    }
  ];

  const stats = [
    { value: 'A+', label: 'Security Rating', icon: Shield },
    { value: '99.9%', label: 'Uptime', icon: Activity },
    { value: '< 50ms', label: 'Latency', icon: Zap },
    { value: '24/7', label: 'Support', icon: Users }
  ];

  const exchanges = [
    { name: 'Binance', status: 'active' },
    { name: 'Bybit', status: 'active' },
    { name: 'Tradovate', status: 'active' },
    { name: 'More...', status: 'coming' }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-green-500/10"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative container mx-auto px-6 py-24">
          <div className={`text-center transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            {/* Main Headline */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 bg-clip-text text-transparent">
                  Agnes Bot Pro
                </span>
              </h1>
              <h2 className="text-2xl md:text-3xl text-gray-300 mb-4">
                Professional Trading Platform
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Advanced cryptocurrency trading with enterprise-grade security, 
                real-time analytics, and automated strategies. Built for professional traders.
              </p>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-green-500/20 border border-green-500/30 rounded-full px-6 py-3 flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">A+ Security Rating</span>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/trading"
                className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
              >
                <span>Start Trading</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-4 rounded-xl font-medium text-lg transition-all flex items-center justify-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-800/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Enterprise-Grade Trading Platform
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built with security-first architecture and professional-grade features 
              for serious cryptocurrency trading.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`${feature.bgColor} border rounded-xl p-8 transition-all duration-300 hover:scale-105 ${
                  currentFeature === index ? 'ring-2 ring-blue-500/50' : ''
                }`}
              >
                <div className={`w-16 h-16 ${feature.bgColor} rounded-lg flex items-center justify-center mb-6`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Feature Details */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Security Features */}
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">
                Bank-Level Security
              </h3>
              <div className="space-y-4">
                {[
                  'HMAC-SHA256 Authentication',
                  'Advanced Rate Limiting',
                  'CSRF Protection',
                  'Real-time Monitoring',
                  'Encrypted Data Storage',
                  'SOC 2 Compliance Ready'
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trading Features */}
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">
                Professional Trading
              </h3>
              <div className="space-y-4">
                {[
                  'Real-time Market Data',
                  'Advanced Order Types',
                  'Technical Indicators',
                  'Portfolio Analytics',
                  'Multi-Exchange Support',
                  'API Trading Integration'
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Exchanges */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Multi-Exchange Support
            </h2>
            <p className="text-xl text-gray-400">
              Trade across multiple platforms with unified security and analytics
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {exchanges.map((exchange, index) => (
              <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center hover:border-blue-500/50 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">{exchange.name}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  exchange.status === 'active' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {exchange.status === 'active' ? 'Active' : 'Coming Soon'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Professional Trading?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join traders who trust Agnes Bot Pro for secure, fast, and intelligent cryptocurrency trading.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/trading"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Launch Trading Platform
            </Link>
            
            <Link 
              href="/trading"
              className="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-4 rounded-xl font-medium text-lg transition-all"
            >
              View Demo Mode
            </Link>
          </div>

          {/* Security Notice */}
          <div className="mt-12 bg-gray-800/50 border border-gray-700 rounded-xl p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Lock className="h-6 w-6 text-green-400" />
              <h3 className="text-lg font-bold text-white">Demo Mode Available</h3>
            </div>
            <p className="text-gray-400">
              Try all features risk-free with simulated trading. No real funds required. 
              Perfect for learning and testing strategies.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Agnes Bot Pro
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>© 2025 Agnes Bot Pro</span>
              <span>•</span>
              <span>Enterprise Trading Platform</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4 text-green-400" />
                <span>Secured</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
