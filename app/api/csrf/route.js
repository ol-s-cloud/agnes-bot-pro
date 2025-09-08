/**
 * CSRF Token API Route - SECURITY PROTECTION
 * Provides CSRF tokens for secure form submissions
 */

import { NextResponse } from 'next/server';
import { globalCSRF } from '../../../lib/security/csrf-protection.js';

export async function GET(request) {
  try {
    // Get session ID for token generation
    const sessionId = globalCSRF.getSessionId(request);
    
    // Generate CSRF token
    const csrfToken = globalCSRF.generateToken(sessionId);
    
    // Set token in cookie (httpOnly for security)
    const response = NextResponse.json({
      csrfToken,
      expires: Date.now() + 3600000, // 1 hour
      sessionId: sessionId.substring(0, 8) // Only show first 8 chars for debugging
    });
    
    // Set secure cookie
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 hour
    });
    
    return response;
    
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { token } = body;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required for validation' },
        { status: 400 }
      );
    }
    
    // Get session ID
    const sessionId = globalCSRF.getSessionId(request);
    
    // Validate token
    const validation = globalCSRF.validateToken(token, sessionId);
    
    return NextResponse.json({
      valid: validation.valid,
      reason: validation.reason,
      message: validation.valid 
        ? 'CSRF token is valid' 
        : globalCSRF.getErrorMessage(validation.reason)
    });
    
  } catch (error) {
    console.error('CSRF token validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate CSRF token' },
      { status: 500 }
    );
  }
}
