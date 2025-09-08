/**
 * Example Trading API Route with Rate Limiting - SECURITY PROTECTED
 * Demonstrates proper integration of rate limiting with trading operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { tradingRateLimiter } from '../../../lib/security/rate-limiter.js';
import BinanceAPI from '../../../lib/trading-apis/binance-api.js';

export async function POST(request) {
  try {
    // Get user identifier
    const userId = getUserId(request);
    
    // Parse request body
    const body = await request.json();
    const { action, exchange = 'binance', ...orderData } = body;
    
    // ✅ SECURITY: Check rate limits before processing
    const rateLimitResult = tradingRateLimiter.isAllowed(
      userId, 
      `/api/trading/${action}`, 
      exchange
    );
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          reason: rateLimitResult.reason,
          retryAfter: rateLimitResult.retryAfter,
          message: getRateLimitMessage(rateLimitResult.reason)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit?.toString() || '0',
            'X-RateLimit-Remaining': '0',
            'Retry-After': Math.ceil((rateLimitResult.retryAfter || 60000) / 1000).toString()
          }
        }
      );
    }
    
    // ✅ SECURITY: Additional checks for high-value trades
    if (action === 'placeOrder' && orderData.quantity * (orderData.price || 50000) > 10000) {
      const highValueCheck = tradingRateLimiter.checkTradingOperation(
        userId, 
        action, 
        orderData.quantity * (orderData.price || 50000)
      );
      
      if (!highValueCheck.allowed) {
        return NextResponse.json(
          {
            error: 'High-value trading limit exceeded',
            reason: highValueCheck.reason,
            message: highValueCheck.message
          },
          { status: 429 }
        );
      }
    }
    
    // Initialize trading API
    const api = new BinanceAPI({
      isDemo: true, // Always start in demo mode for safety
      apiKey: process.env.BINANCE_API_KEY,
      apiSecret: process.env.BINANCE_API_SECRET
    });
    
    let result;
    
    // Handle different trading actions
    switch (action) {
      case 'placeOrder':
        result = await api.placeOrder(orderData);
        break;
        
      case 'getAccountInfo':
        result = await api.getAccountInfo();
        break;
        
      case 'getTicker':
        result = await api.getTicker24hr(orderData.symbol);
        break;
        
      case 'getExchangeInfo':
        result = await api.getExchangeInfo();
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action', validActions: ['placeOrder', 'getAccountInfo', 'getTicker', 'getExchangeInfo'] },
          { status: 400 }
        );
    }
    
    // ✅ SECURITY: Add rate limit headers to successful responses
    return NextResponse.json(
      {
        success: true,
        data: result,
        timestamp: Date.now(),
        rateLimit: {
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime
        }
      },
      {
        headers: {
          'X-RateLimit-Limit': (rateLimitResult.limit || 100).toString(),
          'X-RateLimit-Remaining': (rateLimitResult.remaining || 0).toString(),
          'X-RateLimit-Reset': Math.ceil((rateLimitResult.resetTime || Date.now() + 60000) / 1000).toString()
        }
      }
    );
    
  } catch (error) {
    console.error('Trading API error:', error);
    
    return NextResponse.json(
      {
        error: 'Trading operation failed',
        message: error.message,
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Get user identifier
    const userId = getUserId(request);
    
    // Get rate limit status
    const status = tradingRateLimiter.getStatus(userId);
    
    return NextResponse.json({
      rateLimitStatus: status,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Rate limit status error:', error);
    return NextResponse.json(
      { error: 'Failed to get rate limit status' },
      { status: 500 }
    );
  }
}

/**
 * ✅ SECURE: Extract user identifier from request
 */
function getUserId(request) {
  // Try authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const match = authHeader.match(/Bearer\\s+(.+)/);
    if (match) {
      return `api_${match[1].substring(0, 8)}`;
    }
  }
  
  // Try session (in real app, you'd get this from your auth system)
  const sessionId = request.headers.get('x-session-id');
  if (sessionId) {
    return `session_${sessionId.substring(0, 8)}`;
  }
  
  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return `ip_${ip}`;
}

/**
 * ✅ SECURE: Get user-friendly rate limit messages
 */
function getRateLimitMessage(reason) {
  switch (reason) {
    case 'rate_limit_exceeded':
      return 'Too many trading requests. Please slow down and try again in a minute.';
    case 'temporarily_blocked':
      return 'Your account has been temporarily blocked due to excessive requests. Please wait before trying again.';
    case 'exchange_order_limit':
      return 'Exchange order rate limit exceeded. Please wait before placing more orders.';
    case 'high_value_limit':
      return 'Too many high-value trades detected. Please contact support if you need to increase your limits.';
    default:
      return 'Request limit exceeded. Please try again later.';
  }
}
