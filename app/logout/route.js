import { NextResponse } from 'next/server';
import { AUTH_COOKIE } from '@/lib/auth';

export async function GET(request) {
  const response = NextResponse.redirect(new URL('/login', request.url));

  response.cookies.set(AUTH_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return response;
}
