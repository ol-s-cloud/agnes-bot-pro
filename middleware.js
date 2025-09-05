import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Define protected routes
const protectedRoutes = [
  "/dashboard",
  "/trading",
  "/bots",
  "/strategies",
  "/accounts",
  "/settings",
  "/api/user",
  "/api/bots",
  "/api/strategies",
  "/api/trading",
];

// Define admin routes
const adminRoutes = [
  "/admin",
  "/api/admin",
];

// Define public API routes that don't require auth
const publicApiRoutes = [
  "/api/auth",
  "/api/health",
  "/api/webhook",
];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Allow public API routes
    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    );
    
    const isAdminRoute = adminRoutes.some(route => 
      pathname.startsWith(route)
    );

    // Redirect unauthenticated users from protected routes
    if (isProtectedRoute && !token) {
      const loginUrl = new URL('/', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin access
    if (isAdminRoute && (!token || token.role !== 'ADMIN')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Check subscription status for premium features
    if (pathname.startsWith('/dashboard/analytics') || pathname.startsWith('/dashboard/advanced')) {
      if (!token || token.subscription === 'STARTER') {
        return NextResponse.redirect(new URL('/dashboard/upgrade', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // This callback is called when the middleware runs
        // Return true to continue, false to redirect to sign-in page
        return true; // We handle auth logic in the middleware function
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication API routes)
     * - api/health (health check)
     * - api/webhook (webhooks)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api/auth|api/health|api/webhook|_next/static|_next/image|favicon.ico|public).*)',
  ],
};