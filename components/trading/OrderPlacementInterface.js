/**
 * Order Placement Interface - SECURE TRADING FORMS
 * Advanced order placement with validation, rate limiting, and security
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Percent,
  Calculator,
  Shield,
  Zap
} from 'lucide-react';

export default function OrderPlacementInterface({ 
  selectedExchange = 'binance',
  currentMarketData = {},
  onOrderPlaced,
  accountBalance = 10000 
}) {
  const [orderForm, setOrderForm] = useState({
    symbol: 'BTCUSDT',
    side: 'buy',
    type: 'market',
    quantity: '',
    price: '',
    timeInForce: 'GTC'
  });
  
  const [validation, setValidation] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [calculatedValues, setCalculatedValues] = useState({});

  // Popular trading pairs
  const tradingPairs = [
    'BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT', 
    'DOGEUSDT', 'MATICUSDT', 'LINKUSDT', 'AVAXUSDT'
  ];

  // Initialize CSRF token
  useEffect(() => {
    fetchCSRFToken();
  }, []);

  // Calculate order values when form changes
  useEffect(() => {
    calculateOrderValues();
  }, [orderForm, currentMarketData]);

  const fetchCSRFToken = async () => {
    try {
      const response = await fetch('/api/csrf');
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    } catch (error) {
      console.error('CSRF token fetch error:', error);
    }
  };

  const calculateOrderValues = () => {
    const { symbol, side, type, quantity, price } = orderForm;
    const marketPrice = currentMarketData[symbol]?.price || 50000;
    const orderPrice = type === 'market' ? marketPrice : parseFloat(price) || 0;
    const qty = parseFloat(quantity) || 0;
    
    const total = qty * orderPrice;
    const estimatedFee = total * 0.001; // 0.1% fee
    const totalWithFee = side === 'buy' ? total + estimatedFee : total - estimatedFee;
    
    setCalculatedValues({
      marketPrice,
      orderPrice,
      total,
      estimatedFee,
      totalWithFee,
      percentage: accountBalance > 0 ? (total / accountBalance * 100) : 0
    });
  };

  const validateOrder = () => {
    const errors = {};
    const { symbol, quantity, price, type } = orderForm;
    const { total, totalWithFee } = calculatedValues;

    // Symbol validation
    if (!symbol) {
      errors.symbol = 'Symbol is required';
    }

    // Quantity validation
    if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
      errors.quantity = 'Valid quantity is required';
    } else if (parseFloat(quantity) > 1000000) {
      errors.quantity = 'Quantity too large (max: 1,000,000)';
    }

    // Price validation for limit orders
    if (type === 'limit') {
      if (!price || isNaN(price) || parseFloat(price) <= 0) {
        errors.price = 'Valid price is required for limit orders';
      }
    }

    // Balance validation
    if (orderForm.side === 'buy' && totalWithFee > accountBalance) {
      errors.balance = 'Insufficient balance for this order';
    }

    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setOrderForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear specific validation error when user starts typing
    if (validation[field]) {
      setValidation(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleQuickPercentage = (percentage) => {
    const maxQuantity = orderForm.side === 'buy' 
      ? (accountBalance * (percentage / 100)) / calculatedValues.orderPrice
      : accountBalance * (percentage / 100); // Simplified for demo
    
    setOrderForm(prev => ({
      ...prev,
      quantity: maxQuantity.toFixed(6)
    }));
  };

  const submitOrder = async () => {
    if (!validateOrder()) {
      return;
    }

    setIsSubmitting(true);
    setOrderResult(null);

    try {
      const response = await fetch('/api/trading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          action: 'placeOrder',
          exchange: selectedExchange,
          ...orderForm,
          quantity: parseFloat(orderForm.quantity),
          price: orderForm.type === 'limit' ? parseFloat(orderForm.price) : undefined
        })
      });

      const result = await response.json();

      if (response.ok) {
        setOrderResult({
          success: true,
          data: result.data,
          message: 'Order placed successfully!'
        });
        
        // Reset form on success
        setOrderForm(prev => ({
          ...prev,
          quantity: '',
          price: ''
        }));
        
        // Notify parent component
        onOrderPlaced?.(result.data);
        
      } else {
        setOrderResult({
          success: false,
          message: result.message || 'Order failed to place'
        });
      }
    } catch (error) {
      setOrderResult({
        success: false,
        message: 'Network error: Unable to place order'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Place Order</h2>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-400" />
          <span className="text-sm text-green-400">Secure Trading</span>
        </div>
      </div>

      {/* Order Result Alert */}
      {orderResult && (
        <div className={`mb-6 p-4 rounded-lg border ${
          orderResult.success 
            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <div className="flex items-center space-x-2">
            {orderResult.success ? 
              <CheckCircle className="h-5 w-5" /> : 
              <AlertTriangle className="h-5 w-5" />
            }
            <span className="font-medium">{orderResult.message}</span>
          </div>
          {orderResult.success && orderResult.data && (
            <div className="mt-2 text-sm">
              Order ID: {orderResult.data.orderId}
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        {/* Order Type Toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleInputChange('side', 'buy')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              orderForm.side === 'buy'
                ? 'bg-green-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <TrendingUp className="h-4 w-4 inline mr-2" />
            Buy
          </button>
          <button
            onClick={() => handleInputChange('side', 'sell')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              orderForm.side === 'sell'
                ? 'bg-red-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <TrendingDown className="h-4 w-4 inline mr-2" />
            Sell
          </button>
        </div>

        {/* Market/Limit Toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleInputChange('type', 'market')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              orderForm.type === 'market'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Zap className="h-4 w-4 inline mr-1" />
            Market
          </button>
          <button
            onClick={() => handleInputChange('type', 'limit')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              orderForm.type === 'limit'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Clock className="h-4 w-4 inline mr-1" />
            Limit
          </button>
        </div>

        {/* Symbol Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Trading Pair
          </label>
          <select
            value={orderForm.symbol}
            onChange={(e) => handleInputChange('symbol', e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {tradingPairs.map(pair => (
              <option key={pair} value={pair}>{pair}</option>
            ))}
          </select>
          {validation.symbol && (
            <p className="mt-1 text-sm text-red-400">{validation.symbol}</p>
          )}
        </div>

        {/* Price Input (for limit orders) */}
        {orderForm.type === 'limit' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price (USDT)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={orderForm.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="Enter price"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {validation.price && (
              <p className="mt-1 text-sm text-red-400">{validation.price}</p>
            )}
            <p className="mt-1 text-sm text-gray-400">
              Market Price: {formatCurrency(calculatedValues.marketPrice)}
            </p>
          </div>
        )}

        {/* Quantity Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Quantity
          </label>
          <div className="relative">
            <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="number"
              step="0.000001"
              value={orderForm.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              placeholder="Enter quantity"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {validation.quantity && (
            <p className="mt-1 text-sm text-red-400">{validation.quantity}</p>
          )}
          
          {/* Quick Percentage Buttons */}
          <div className="flex space-x-2 mt-2">
            {[25, 50, 75, 100].map(percentage => (
              <button
                key={percentage}
                onClick={() => handleQuickPercentage(percentage)}
                className="flex-1 py-1 px-2 text-xs bg-gray-600 hover:bg-gray-500 rounded transition-colors"
              >
                {percentage}%
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-700/30 rounded-lg p-4 space-y-2">
          <h3 className="font-medium text-gray-300 mb-3">Order Summary</h3>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Order Type:</span>
            <span className="font-medium">
              {orderForm.type.toUpperCase()} {orderForm.side.toUpperCase()}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Price:</span>
            <span className="font-medium">
              {formatCurrency(calculatedValues.orderPrice)}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Quantity:</span>
            <span className="font-medium">{orderForm.quantity || '0'}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total:</span>
            <span className="font-medium">{formatCurrency(calculatedValues.total)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Est. Fee (0.1%):</span>
            <span className="font-medium">{formatCurrency(calculatedValues.estimatedFee)}</span>
          </div>
          
          <div className="border-t border-gray-600 pt-2">
            <div className="flex justify-between font-medium">
              <span>Total {orderForm.side === 'buy' ? 'Cost' : 'Received'}:</span>
              <span className={orderForm.side === 'buy' ? 'text-red-400' : 'text-green-400'}>
                {formatCurrency(calculatedValues.totalWithFee)}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">% of Balance:</span>
            <span className={`font-medium ${
              calculatedValues.percentage > 50 ? 'text-orange-400' : 'text-gray-300'
            }`}>
              {calculatedValues.percentage.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Balance Warning */}
        {validation.balance && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">{validation.balance}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={submitOrder}
          disabled={isSubmitting || Object.keys(validation).length > 0}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            isSubmitting || Object.keys(validation).length > 0
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : orderForm.side === 'buy'
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-green-500/25'
              : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/25'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Placing Order...</span>
            </div>
          ) : (
            `${orderForm.side === 'buy' ? 'Buy' : 'Sell'} ${orderForm.symbol}`
          )}
        </button>

        {/* Demo Notice */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-blue-400">
            <Shield className="h-4 w-4" />
            <span className="text-sm">
              Demo Mode: Orders are simulated and no real trading occurs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
