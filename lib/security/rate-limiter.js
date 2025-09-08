/**
 * Comprehensive Rate Limiting System - SECURITY PROTECTION
 * Prevents API abuse and protects against hitting exchange rate limits
 */

export class RateLimiter {
  constructor(options = {}) {
    // Default rate limits (per minute)
    this.limits = {
      trading: options.trading || 10,        // 10 trades per minute
      account: options.account || 30,        // 30 account requests per minute
      market: options.market || 60,          // 60 market data requests per minute
      websocket: options.websocket || 5,     // 5 websocket connections per minute
      global: options.global || 100         // 100 total requests per minute
    };
    
    this.windowMs = options.windowMs || 60000; // 1 minute window
    this.requests = new Map(); // Store request history
    this.blockedUntil = new Map(); // Store temporary blocks
    
    // Exchange-specific limits
    this.exchangeLimits = {
      binance: {
        orders: 10,      // 10 orders per second
        weight: 1200,    // 1200 weight per minute
        raw: 6000        // 6000 raw requests per 5 minutes
      },
      bybit: {
        orders: 20,      // 20 orders per second
        queries: 120     // 120 queries per minute
      },
      tradovate: {
        orders: 500,     // 500 orders per day
        queries: 1000    // 1000 queries per day
      }
    };

    console.log('🛡️ Rate Limiter initialized with limits:', this.limits);
  }

  /**
   * ✅ SECURE: Check if request is allowed
   */
  isAllowed(userId, endpoint, exchange = 'general') {
    const now = Date.now();
    
    // Check if user is temporarily blocked
    if (this.isBlocked(userId, now)) {
      return {
        allowed: false,
        reason: 'temporarily_blocked',
        retryAfter: this.getRetryAfter(userId, now)
      };
    }

    // Determine rate limit type
    const limitType = this.getLimitType(endpoint);
    const limit = this.limits[limitType];
    
    // Get user's request history for this endpoint
    const key = `${userId}:${limitType}`;
    const userRequests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(
      time => now - time < this.windowMs
    );
    
    // Check if limit exceeded
    if (validRequests.length >= limit) {
      this.addViolation(userId, limitType);
      return {
        allowed: false,
        reason: 'rate_limit_exceeded',
        limit: limit,
        current: validRequests.length,
        retryAfter: this.windowMs - (now - validRequests[0])
      };
    }
    
    // Check exchange-specific limits
    const exchangeCheck = this.checkExchangeLimit(userId, exchange, endpoint, now);
    if (!exchangeCheck.allowed) {
      return exchangeCheck;
    }
    
    // Record this request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    // Update global counter
    this.updateGlobalCount(userId, now);
    
    return {
      allowed: true,
      remaining: limit - validRequests.length,
      resetTime: now + this.windowMs
    };
  }

  /**
   * ✅ SECURE: Check exchange-specific rate limits
   */
  checkExchangeLimit(userId, exchange, endpoint, now) {
    if (!this.exchangeLimits[exchange]) {
      return { allowed: true };
    }

    const exchangeLimit = this.exchangeLimits[exchange];
    const key = `${userId}:${exchange}`;
    
    // Check orders per second for trading endpoints
    if (endpoint.includes('order') || endpoint.includes('trade')) {
      const orderKey = `${key}:orders`;
      const recentOrders = this.requests.get(orderKey) || [];
      const ordersInLastSecond = recentOrders.filter(
        time => now - time < 1000
      ).length;
      
      if (ordersInLastSecond >= exchangeLimit.orders) {
        return {
          allowed: false,
          reason: 'exchange_order_limit',
          exchange: exchange,
          retryAfter: 1000
        };
      }
      
      // Record order
      recentOrders.push(now);
      this.requests.set(orderKey, recentOrders.slice(-exchangeLimit.orders));
    }
    
    return { allowed: true };
  }

  /**
   * ✅ SECURE: Determine rate limit type based on endpoint
   */
  getLimitType(endpoint) {
    if (endpoint.includes('order') || endpoint.includes('trade')) {
      return 'trading';
    }
    if (endpoint.includes('account') || endpoint.includes('balance')) {
      return 'account';
    }
    if (endpoint.includes('ticker') || endpoint.includes('market') || endpoint.includes('kline')) {
      return 'market';
    }
    if (endpoint.includes('ws') || endpoint.includes('websocket')) {
      return 'websocket';
    }
    return 'global';
  }

  /**
   * ✅ SECURE: Check if user is temporarily blocked
   */
  isBlocked(userId, now) {
    const blockUntil = this.blockedUntil.get(userId);
    return blockUntil && now < blockUntil;
  }

  /**
   * ✅ SECURE: Get retry after time for blocked user
   */
  getRetryAfter(userId, now) {
    const blockUntil = this.blockedUntil.get(userId);
    return blockUntil ? blockUntil - now : 0;
  }

  /**
   * ✅ SECURE: Add violation and potentially block user
   */
  addViolation(userId, limitType) {
    const violationKey = `${userId}:violations`;
    const violations = this.requests.get(violationKey) || [];
    const now = Date.now();
    
    // Remove old violations (older than 5 minutes)
    const recentViolations = violations.filter(
      time => now - time < 300000
    );
    
    recentViolations.push(now);
    this.requests.set(violationKey, recentViolations);
    
    // Progressive blocking: more violations = longer blocks
    if (recentViolations.length >= 5) {
      // Block for 5 minutes after 5 violations
      this.blockedUntil.set(userId, now + 300000);
      console.warn(`🚨 User ${userId} blocked for 5 minutes (${recentViolations.length} violations)`);
    } else if (recentViolations.length >= 3) {
      // Block for 1 minute after 3 violations
      this.blockedUntil.set(userId, now + 60000);
      console.warn(`⚠️ User ${userId} blocked for 1 minute (${recentViolations.length} violations)`);
    }
    
    console.log(`📊 Rate limit violation: User ${userId}, Type: ${limitType}, Count: ${recentViolations.length}`);
  }

  /**
   * ✅ SECURE: Update global request counter
   */
  updateGlobalCount(userId, now) {
    const globalKey = `${userId}:global`;
    const globalRequests = this.requests.get(globalKey) || [];
    
    // Remove old requests
    const validGlobalRequests = globalRequests.filter(
      time => now - time < this.windowMs
    );
    
    validGlobalRequests.push(now);
    this.requests.set(globalKey, validGlobalRequests);
    
    // Check global limit
    if (validGlobalRequests.length >= this.limits.global) {
      this.addViolation(userId, 'global');
    }
  }

  /**
   * ✅ SECURE: Get current rate limit status for user
   */
  getStatus(userId) {
    const now = Date.now();
    const status = {};
    
    for (const [limitType, limit] of Object.entries(this.limits)) {
      const key = `${userId}:${limitType}`;
      const requests = this.requests.get(key) || [];
      const validRequests = requests.filter(
        time => now - time < this.windowMs
      );
      
      status[limitType] = {
        limit: limit,
        used: validRequests.length,
        remaining: Math.max(0, limit - validRequests.length),
        resetTime: now + this.windowMs
      };
    }
    
    status.blocked = this.isBlocked(userId, now);
    if (status.blocked) {
      status.blockedUntil = this.blockedUntil.get(userId);
    }
    
    return status;
  }

  /**
   * ✅ SECURE: Reset rate limits for user (admin function)
   */
  resetUser(userId) {
    // Remove all rate limit data for user
    const keysToRemove = [];
    for (const key of this.requests.keys()) {
      if (key.startsWith(`${userId}:`)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => this.requests.delete(key));
    this.blockedUntil.delete(userId);
    
    console.log(`🔄 Rate limits reset for user: ${userId}`);
  }

  /**
   * ✅ SECURE: Clean up old data (run periodically)
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    // Clean up old requests
    for (const [key, requests] of this.requests.entries()) {
      if (Array.isArray(requests)) {
        const validRequests = requests.filter(
          time => now - time < this.windowMs * 2 // Keep data for 2 windows
        );
        
        if (validRequests.length === 0) {
          this.requests.delete(key);
          cleaned++;
        } else if (validRequests.length !== requests.length) {
          this.requests.set(key, validRequests);
        }
      }
    }
    
    // Clean up expired blocks
    for (const [userId, blockUntil] of this.blockedUntil.entries()) {
      if (now > blockUntil) {
        this.blockedUntil.delete(userId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Rate limiter cleanup: ${cleaned} entries removed`);
    }
  }

  /**
   * ✅ SECURE: Get rate limiter statistics
   */
  getStats() {
    const now = Date.now();
    const stats = {
      totalUsers: new Set([...this.requests.keys()].map(key => key.split(':')[0])).size,
      activeUsers: 0,
      blockedUsers: 0,
      totalRequests: 0,
      recentRequests: 0
    };
    
    // Count active users and requests
    for (const [key, requests] of this.requests.entries()) {
      if (Array.isArray(requests)) {
        stats.totalRequests += requests.length;
        const recentRequests = requests.filter(time => now - time < this.windowMs);
        stats.recentRequests += recentRequests.length;
        
        if (recentRequests.length > 0) {
          stats.activeUsers++;
        }
      }
    }
    
    stats.blockedUsers = this.blockedUntil.size;
    
    return stats;
  }
}

/**
 * ✅ SECURE: Rate limiting middleware for API routes
 */
export function createRateLimitMiddleware(options = {}) {
  const rateLimiter = new RateLimiter(options);
  
  // Clean up old data every 5 minutes
  setInterval(() => rateLimiter.cleanup(), 300000);
  
  return async function rateLimitMiddleware(req, res, next) {
    // Get user ID (from session, API key, or IP address)
    const userId = req.user?.id || req.apiKey || req.ip || 'anonymous';
    
    // Get endpoint identifier
    const endpoint = req.path || req.url;
    
    // Get exchange from request
    const exchange = req.body?.exchange || req.query?.exchange || 'general';
    
    // Check rate limit
    const result = rateLimiter.isAllowed(userId, endpoint, exchange);
    
    if (!result.allowed) {
      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': result.limit || 0,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': Math.ceil((Date.now() + (result.retryAfter || 60000)) / 1000),
        'Retry-After': Math.ceil((result.retryAfter || 60000) / 1000)
      });
      
      return res.status(429).json({
        error: 'Rate limit exceeded',
        reason: result.reason,
        retryAfter: result.retryAfter,
        message: 'Too many requests. Please try again later.'
      });
    }
    
    // Set rate limit headers for successful requests
    res.set({
      'X-RateLimit-Limit': result.limit || rateLimiter.limits.global,
      'X-RateLimit-Remaining': result.remaining || 0,
      'X-RateLimit-Reset': Math.ceil((result.resetTime || Date.now() + 60000) / 1000)
    });
    
    // Attach rate limiter to request for access in routes
    req.rateLimiter = rateLimiter;
    req.userId = userId;
    
    next();
  };
}

/**
 * ✅ SECURE: Trading-specific rate limiter
 */
export class TradingRateLimiter extends RateLimiter {
  constructor(options = {}) {
    // More restrictive limits for trading
    super({
      trading: options.trading || 5,      // 5 trades per minute
      account: options.account || 20,     // 20 account requests per minute
      market: options.market || 100,      // 100 market data requests per minute
      websocket: options.websocket || 3,  // 3 websocket connections per minute
      global: options.global || 150,      // 150 total requests per minute
      ...options
    });
  }

  /**
   * ✅ SECURE: Special handling for high-risk trading operations
   */
  checkTradingOperation(userId, operation, amount) {
    const now = Date.now();
    
    // Track high-value trades
    if (amount > 10000) { // $10,000+
      const highValueKey = `${userId}:high_value`;
      const highValueTrades = this.requests.get(highValueKey) || [];
      const recentHighValue = highValueTrades.filter(
        time => now - time < 3600000 // 1 hour
      );
      
      if (recentHighValue.length >= 3) {
        return {
          allowed: false,
          reason: 'high_value_limit',
          message: 'Too many high-value trades. Please contact support.'
        };
      }
      
      recentHighValue.push(now);
      this.requests.set(highValueKey, recentHighValue);
    }
    
    return { allowed: true };
  }
}

// Export singleton instance
export const globalRateLimiter = new RateLimiter();
export const tradingRateLimiter = new TradingRateLimiter();

export default RateLimiter;
