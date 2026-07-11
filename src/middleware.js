import { NextResponse } from 'next/server';

function decodeJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

function isValidToken(token) {
  if (!token) return false;
  const payload = decodeJwt(token);
  if (!payload || !payload.id) return false;
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) return false;
  return true;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Admin route protection
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }
    const adminToken = request.cookies.get('adminToken')?.value;
    if (!isValidToken(adminToken)) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Private customer routes
  const protectedUserRoutes = ['/my-profile', '/my-orders', '/orders', '/addresses', '/buynow'];
  const isProtectedUserRoute = protectedUserRoutes.some(route => pathname.startsWith(route));
  if (isProtectedUserRoute) {
    const token = request.cookies.get('token')?.value;
    if (!isValidToken(token)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectAfterLogin', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/my-profile/:path*',
    '/my-orders/:path*',
    '/orders/:path*',
    '/addresses/:path*',
    '/buynow/:path*',
  ],
};
