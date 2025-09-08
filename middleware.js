/**
 * Enhanced Next.js Middleware with Complete Security Suite
 * Rate limiting + Security headers + CSRF protection + Input validation
 */

import { NextResponse } from 'next/server';
import { createRateLimitMiddleware, tradingRateLimiter } from './lib/security/rate-limiter.js';
import { createSecurityMiddleware, globalCSRF } from './lib/security/csrf-protection.js';

// Initialize security middleware
const securityMiddleware = createSecurityMiddleware({
  allowedOrigins: [
    process.env.NEXTAUTH_URL,
    process.env.APP_URL,
    'http://localhost:3000',
    'https://localhost:3000'
  ].filter(Boolean),
  maxRequestSize: 5 * 1024 * 1024, // 5MB
  validateUserAgent: true,
  csrf: {
    secret: process.env.NEXTAUTH_SECRET
  }
});

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // ✅ SECURITY: Apply comprehensive protection to API routes
  if (pathname.startsWith('/api/')) {
    try {
      // 1. Rate Limiting
      const userId = getUserId(request);
      const endpoint = pathname;
      const exchange = getExchange(request);
      
      const rateLimitResult = tradingRateLimiter.isAllowed(userId, endpoint, exchange);
      
      if (!rateLimitResult.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: 'Rate limit exceeded',
            reason: rateLimitResult.reason,
            retryAfter: rateLimitResult.retryAfter,
            message: getRateLimitMessage(rateLimitResult.reason)
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': rateLimitResult.limit?.toString() || '0',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.ceil((Date.now() + (rateLimitResult.retryAfter || 60000)) / 1000).toString(),
              'Retry-After': Math.ceil((rateLimitResult.retryAfter || 60000) / 1000).toString()
            }
          }
        );
      }
      
      // 2. CSRF Protection for state-changing operations
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        // Skip CSRF for specific endpoints that handle their own auth
        const skipCSRF = [
          '/api/auth/',
          '/api/csrf',
          '/api/webhooks/'
        ].some(path => pathname.startsWith(path));
        
        if (!skipCSRF) {
          const sessionId = globalCSRF.getSessionId(request);
          const csrfToken = request.headers.get('x-csrf-token') || 
                           request.nextUrl.searchParams.get('csrfToken');
          
          const csrfValidation = globalCSRF.validateToken(csrfToken, sessionId);
          
          if (!csrfValidation.valid) {
            return new NextResponse(
              JSON.stringify({
                error: 'CSRF validation failed',
                reason: csrfValidation.reason,
                message: globalCSRF.getErrorMessage(csrfValidation.reason)
              }),
              {
                status: 403,
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
          }
        }
      }
      
      // 3. Origin Validation for sensitive endpoints
      if (pathname.startsWith('/api/trading/') || pathname.startsWith('/api/account/')) {
        const origin = request.headers.get('origin');
        const allowedOrigins = [
          process.env.NEXTAUTH_URL,
          process.env.APP_URL,
          'http://localhost:3000',
          'https://localhost:3000'
        ].filter(Boolean);
        
        if (origin && !allowedOrigins.includes(origin)) {
          return new NextResponse(
            JSON.stringify({
              error: 'Origin not allowed',
              origin: origin
            }),
            {
              status: 403,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }
      }
      
      // 4. Content-Type validation for data modification
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const contentType = request.headers.get('content-type');
        if (contentType && !contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
          return new NextResponse(
            JSON.stringify({
              error: 'Invalid content type',
              expected: 'application/json',
              received: contentType
            }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }
      }
      
      // Create response with security headers
      const response = NextResponse.next();
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', (rateLimitResult.limit || 100).toString());
      response.headers.set('X-RateLimit-Remaining', (rateLimitResult.remaining || 0).toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil((rateLimitResult.resetTime || Date.now() + 60000) / 1000).toString());
      
      // Add API-specific security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      
      return response;
      
    } catch (error) {
      console.error('Middleware error:', error);
      // Fail open for availability
      return NextResponse.next();
    }
  }
  
  // ✅ SECURITY: Apply security headers to all routes
  const response = NextResponse.next();
  
  // Basic security headers for all routes
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // HSTS for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  return response;
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
  // Try URL path
  const pathname = request.nextUrl.pathname;
  if (pathname.includes('binance')) return 'binance';
  if (pathname.includes('bybit')) return 'bybit';
  if (pathname.includes('tradovate')) return 'tradovate';
  
  // Try query parameters
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
    // Match specific protected routes
    '/trading/:path*',
    '/dashboard/:path*',
    '/admin/:path*'
  ]
};
