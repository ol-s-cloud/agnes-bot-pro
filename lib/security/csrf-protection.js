/**
 * CSRF Protection and Security Utilities - SECURITY PROTECTION
 * Provides CSRF tokens and additional security validations
 */

import crypto from 'crypto';

export class CSRFProtection {
  constructor(options = {}) {
    this.secret = options.secret || process.env.NEXTAUTH_SECRET || 'default-csrf-secret';
    this.tokenLength = options.tokenLength || 32;
    this.maxAge = options.maxAge || 3600000; // 1 hour
    this.cookieName = options.cookieName || 'csrf-token';
    this.headerName = options.headerName || 'x-csrf-token';
  }

  /**
   * ✅ SECURE: Generate CSRF token
   */
  generateToken(sessionId = 'anonymous') {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(this.tokenLength);
    const payload = `${sessionId}:${timestamp}:${randomBytes.toString('hex')}`;
    
    const hmac = crypto.createHmac('sha256', this.secret);
    hmac.update(payload);
    const signature = hmac.digest('hex');
    
    return `${Buffer.from(payload).toString('base64')}.${signature}`;
  }

  /**
   * ✅ SECURE: Validate CSRF token
   */
  validateToken(token, sessionId = 'anonymous') {
    if (!token || typeof token !== 'string') {
      return { valid: false, reason: 'missing_token' };
    }

    try {
      const [payloadB64, signature] = token.split('.');
      if (!payloadB64 || !signature) {
        return { valid: false, reason: 'invalid_format' };
      }

      const payload = Buffer.from(payloadB64, 'base64').toString();
      const [tokenSessionId, timestamp, randomBytes] = payload.split(':');

      // Verify session matches
      if (tokenSessionId !== sessionId) {
        return { valid: false, reason: 'session_mismatch' };
      }

      // Check expiration
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > this.maxAge) {
        return { valid: false, reason: 'token_expired' };
      }

      // Verify signature
      const hmac = crypto.createHmac('sha256', this.secret);
      hmac.update(payload);
      const expectedSignature = hmac.digest('hex');

      if (signature !== expectedSignature) {
        return { valid: false, reason: 'invalid_signature' };
      }

      return { valid: true, age: tokenAge };
    } catch (error) {
      return { valid: false, reason: 'parse_error' };
    }
  }

  /**
   * ✅ SECURE: Middleware for CSRF protection
   */
  middleware() {
    return async (req, res, next) => {
      // Skip CSRF for GET, HEAD, OPTIONS
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      // Get session ID
      const sessionId = this.getSessionId(req);
      
      // Get token from header or body
      const token = req.headers[this.headerName] || 
                   req.body?.csrfToken || 
                   req.query?.csrfToken;

      const validation = this.validateToken(token, sessionId);
      
      if (!validation.valid) {
        return res.status(403).json({
          error: 'CSRF validation failed',
          reason: validation.reason,
          message: this.getErrorMessage(validation.reason)
        });
      }

      next();
    };
  }

  /**
   * ✅ SECURE: Extract session ID from request
   */
  getSessionId(req) {
    // Try session cookie first
    const sessionCookie = req.cookies?.['next-auth.session-token'];
    if (sessionCookie) {
      return sessionCookie.substring(0, 16); // Use first 16 chars
    }

    // Try authorization header
    const authHeader = req.headers?.authorization;
    if (authHeader) {
      const match = authHeader.match(/Bearer\s+(.+)/);
      if (match) {
        return match[1].substring(0, 16);
      }
    }

    // Fall back to IP
    const forwarded = req.headers?.['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0] : req.headers?.['x-real-ip'] || 'anonymous';
    return `ip_${ip}`;
  }

  /**
   * ✅ SECURE: Get user-friendly error messages
   */
  getErrorMessage(reason) {
    switch (reason) {
      case 'missing_token':
        return 'CSRF token is required for this operation.';
      case 'invalid_format':
        return 'CSRF token format is invalid.';
      case 'session_mismatch':
        return 'CSRF token does not match your session.';
      case 'token_expired':
        return 'CSRF token has expired. Please refresh the page.';
      case 'invalid_signature':
        return 'CSRF token signature is invalid.';
      default:
        return 'CSRF validation failed. Please try again.';
    }
  }
}

/**
 * ✅ SECURE: Security validation utilities
 */
export class SecurityValidator {
  static validateOrigin(req, allowedOrigins = []) {
    const origin = req.headers.origin || req.headers.referer;
    
    if (!origin) {
      return { valid: false, reason: 'missing_origin' };
    }

    // Default allowed origins
    const defaultOrigins = [
      'http://localhost:3000',
      'https://localhost:3000',
      process.env.NEXTAUTH_URL,
      process.env.APP_URL
    ].filter(Boolean);

    const allAllowed = [...defaultOrigins, ...allowedOrigins];
    
    try {
      const originUrl = new URL(origin);
      const isAllowed = allAllowed.some(allowed => {
        try {
          const allowedUrl = new URL(allowed);
          return originUrl.origin === allowedUrl.origin;
        } catch {
          return false;
        }
      });

      return { 
        valid: isAllowed, 
        reason: isAllowed ? 'valid' : 'origin_not_allowed',
        origin: originUrl.origin
      };
    } catch {
      return { valid: false, reason: 'invalid_origin_format' };
    }
  }

  static validateContentType(req, allowedTypes = ['application/json']) {
    const contentType = req.headers['content-type'];
    
    if (!contentType) {
      return { valid: false, reason: 'missing_content_type' };
    }

    const isAllowed = allowedTypes.some(type => 
      contentType.toLowerCase().includes(type.toLowerCase())
    );

    return {
      valid: isAllowed,
      reason: isAllowed ? 'valid' : 'content_type_not_allowed',
      contentType
    };
  }

  static validateUserAgent(req) {
    const userAgent = req.headers['user-agent'];
    
    if (!userAgent) {
      return { valid: false, reason: 'missing_user_agent' };
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
    
    return {
      valid: !isSuspicious,
      reason: isSuspicious ? 'suspicious_user_agent' : 'valid',
      userAgent,
      suspicious: isSuspicious
    };
  }

  static validateRequestSize(req, maxSize = 1024 * 1024) { // 1MB default
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    return {
      valid: contentLength <= maxSize,
      reason: contentLength <= maxSize ? 'valid' : 'request_too_large',
      size: contentLength,
      maxSize
    };
  }
}

/**
 * ✅ SECURE: API security middleware
 */
export function createSecurityMiddleware(options = {}) {
  const csrf = new CSRFProtection(options.csrf);
  
  return async (req, res, next) => {
    try {
      // 1. Validate origin for non-GET requests
      if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        const originCheck = SecurityValidator.validateOrigin(req, options.allowedOrigins);
        if (!originCheck.valid) {
          return res.status(403).json({
            error: 'Origin validation failed',
            reason: originCheck.reason
          });
        }
      }

      // 2. Validate content type for POST/PUT requests
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentTypeCheck = SecurityValidator.validateContentType(req);
        if (!contentTypeCheck.valid) {
          return res.status(400).json({
            error: 'Content type validation failed',
            reason: contentTypeCheck.reason
          });
        }
      }

      // 3. Validate request size
      const sizeCheck = SecurityValidator.validateRequestSize(req, options.maxRequestSize);
      if (!sizeCheck.valid) {
        return res.status(413).json({
          error: 'Request too large',
          maxSize: sizeCheck.maxSize,
          actualSize: sizeCheck.size
        });
      }

      // 4. Optional: Validate user agent
      if (options.validateUserAgent) {
        const userAgentCheck = SecurityValidator.validateUserAgent(req);
        if (!userAgentCheck.valid) {
          console.warn('Suspicious user agent detected:', userAgentCheck.userAgent);
          // Don't block, just log for now
        }
      }

      next();
    } catch (error) {
      console.error('Security middleware error:', error);
      return res.status(500).json({
        error: 'Security validation failed'
      });
    }
  };
}

// Export singleton instances
export const globalCSRF = new CSRFProtection();
export const securityValidator = SecurityValidator;

export default CSRFProtection;
