/**
 * Unified Trading Dashboard Page
 * Main trading interface with all platforms integrated
 */

'use client';

import { Suspense } from 'react';
import UnifiedTradingDashboard from '../../../components/trading/UnifiedTradingDashboard';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const TradingDashboardLoading = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center space-x-4">
          <ChartBarIcon className="h-8 w-8 text-blue-500" />
          <h1 className="text-xl font-bold">Agnes Bot Pro - Loading...</h1>
        </div>
      </div>
      
      {/* Loading Content */}
      <div className="flex">
        {/* Left Sidebar Skeleton */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 space-y-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded mb-3"></div>
            <div className="space-y-2">
              <div className="bg-gray-700 p-3 rounded">
                <div className="h-4 bg-gray-600 rounded mb-2"></div>
                <div className="h-8 bg-gray-600 rounded mb-1"></div>
                <div className="h-3 bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Chart Area Skeleton */}
        <div className="flex-1 p-4">
          <div className="bg-gray-800 rounded-lg animate-pulse" style={{ height: '600px' }}>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ChartBarIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <div className="text-gray-400">Loading Trading Dashboard...</div>
                <div className="text-sm text-gray-500 mt-2">
                  Connecting to trading platforms and analytics APIs
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar Skeleton */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 space-y-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded mb-3"></div>
            <div className="space-y-3">
              <div className="h-10 bg-gray-700 rounded"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-700 rounded"></div>
              </div>
              <div className="h-10 bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TradingDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Suspense fallback={<TradingDashboardLoading />}>
        <UnifiedTradingDashboard />
      </Suspense>
    </div>
  );
};

export default TradingDashboardPage;