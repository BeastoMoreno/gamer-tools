import { NextResponse } from 'next/server';
import { serverAuth } from '@/lib/supabase/server';
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const destination =
    url.searchParams.get('next') === '/reset-password' ? '/reset-password' : '/profile';
  const client = await serverAuth();
  if (code && client) {
    try {
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (!error)
        return NextResponse.redirect(new URL(destination, url.origin), {
          headers: { 'Cache-Control': 'private, no-store' },
        });
    } catch {
      /* Failed exchanges return to sign-in with a recoverable message. */
    }
  }
  return NextResponse.redirect(new URL('/sign-in?error=callback', url.origin), {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
