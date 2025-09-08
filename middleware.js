/**
 * Next.js Middleware with Rate Limiting - SECURITY PROTECTION
 * Applies rate limiting to all API routes
 */

import { NextResponse } from 'next/server';
import { createRateLimitMiddleware, tradingRateLimiter } from './lib/security/rate-limiter.js';

// Initialize rate limiting middleware
const rateLimitMiddleware = createRateLimitMiddleware({
  trading: 10,     // 10 trading requests per minute
  account: 30,     // 30 account requests per minute
  market: 60,      // 60 market data requests per minute
  websocket: 5,    // 5 websocket connections per minute
  global: 100      // 100 total requests per minute
});

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    try {
      // Get user identifier (IP address, user ID, or API key)
      const userId = getUserId(request);
      
      // Get endpoint and exchange info
      const endpoint = pathname;
      const exchange = getExchange(request);
      
      // Check rate limit
      const result = tradingRateLimiter.isAllowed(userId, endpoint, exchange);
      
      if (!result.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: 'Rate limit exceeded',
            reason: result.reason,
            retryAfter: result.retryAfter,
            message: getRateLimitMessage(result.reason)
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': result.limit?.toString() || '0',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.ceil((Date.now() + (result.retryAfter || 60000)) / 1000).toString(),
              'Retry-After': Math.ceil((result.retryAfter || 60000) / 1000).toString()
            }
          }
        );
      }
      
      // Add rate limit headers to successful requests
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', (result.limit || 100).toString());
      response.headers.set('X-RateLimit-Remaining', (result.remaining || 0).toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil((result.resetTime || Date.now() + 60000) / 1000).toString());
      
      return response;
      
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Continue without rate limiting on error (fail open for availability)
      return NextResponse.next();
    }
  }
  
  // Apply security headers to all routes
  const response = NextResponse.next();
  
  // Security headers (we'll enhance these in step 3)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

/**
 * ✅ SECURE: Extract user identifier from request
 */
function getUserId(request) {
  // Try to get user ID from various sources
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // Extract API key or session token
    const match = authHeader.match(/Bearer\s+(.+)/);
    if (match) {
      return `api_${match[1].substring(0, 8)}`; // Use first 8 chars of token
    }
  }
  
  // Try session cookie
  const sessionCookie = request.cookies.get('next-auth.session-token');
  if (sessionCookie) {
    return `session_${sessionCookie.value.substring(0, 8)}`;
  }
  
  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return `ip_${ip}`;
}

/**
 * ✅ SECURE: Extract exchange information from request
 */
function getExchange(request) {
  // Try to get exchange from URL path
  const pathname = request.nextUrl.pathname;
  if (pathname.includes('binance')) return 'binance';
  if (pathname.includes('bybit')) return 'bybit';
  if (pathname.includes('tradovate')) return 'tradovate';
  
  // Try to get from query parameters
  const searchParams = request.nextUrl.searchParams;
  const exchange = searchParams.get('exchange');
  if (exchange) return exchange.toLowerCase();
  
  return 'general';
}

/**
 * ✅ SECURE: Get user-friendly rate limit messages
 */
function getRateLimitMessage(reason) {
  switch (reason) {
    case 'rate_limit_exceeded':
      return 'Too many requests. Please slow down and try again in a minute.';
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

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match specific trading routes
    '/trading/:path*',
    '/dashboard/:path*'
  ]
};
