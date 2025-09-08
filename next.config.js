/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  webpack: (config, { isServer }) => {
    // Handle crypto polyfill for browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
      };
    }
    return config;
  },
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  /**
   * ✅ SECURITY: Comprehensive Security Headers
   * Protects against XSS, clickjacking, CSRF, and other web attacks
   */
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          // ✅ SECURITY: Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // ✅ SECURITY: Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // ✅ SECURITY: Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // ✅ SECURITY: Enable XSS protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // ✅ SECURITY: Control resource loading and prevent XSS
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://api.binance.com https://testnet.binance.vision https://api-testnet.bybit.com https://api.bybit.com https://demo.tradovateapi.com https://live.tradovateapi.com wss: ws:",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          // ✅ SECURITY: Enforce HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          // ✅ SECURITY: Control which features can be used
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'payment=(self)',
              'usb=()',
              'interest-cohort=()'
            ].join(', ')
          }
        ]
      },
      {
        // Additional headers for API routes
        source: '/api/(.*)',
        headers: [
          // ✅ SECURITY: Prevent API from being embedded
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // ✅ SECURITY: Indicate this is an API
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // ✅ SECURITY: Cache control for sensitive data
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
          },
          // ✅ SECURITY: Prevent caching sensitive data
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          // ✅ SECURITY: Ensure fresh data
          {
            key: 'Expires',
            value: '0'
          }
        ]
      },
      {
        // Relaxed headers for trading WebSocket connections
        source: '/api/trading/websocket',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? 'https://yourdomain.com' 
              : 'http://localhost:3000'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With'
          }
        ]
      }
    ];
  },

  /**
   * ✅ SECURITY: Configure redirects for security
   */
  async redirects() {
    return [
      // Redirect HTTP to HTTPS in production
      ...(process.env.NODE_ENV === 'production' ? [
        {
          source: '/:path*',
          has: [
            {
              type: 'header',
              key: 'x-forwarded-proto',
              value: 'http'
            }
          ],
          destination: 'https://:host/:path*',
          permanent: true
        }
      ] : [])
    ];
  },

  /**
   * ✅ SECURITY: Configure rewrites for API versioning
   */
  async rewrites() {
    return [
      // API versioning
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*'
      }
    ];
  }
};

module.exports = nextConfig;
