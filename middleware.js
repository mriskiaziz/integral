import { NextResponse } from 'next/server';
import { AUTH_COOKIE, verifySessionToken } from '@/lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(AUTH_COOKIE)?.value);

  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }

    if (session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/user', request.url));
    }
  }

  if (pathname.startsWith('/user') || pathname.startsWith('/api/sessions')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }
  }

  if ((pathname === '/login' || pathname === '/register') && session) {
    const destination = session.role === 'ADMIN' ? '/admin' : '/user';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/api/sessions/:path*', '/login', '/register'],
};
