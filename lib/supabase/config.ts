export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
export const authConfigured = Boolean(supabaseUrl && supabaseKey);
export const socialProviders = [
  { id: 'google', name: 'Google', enabled: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === 'true' },
  {
    id: 'facebook',
    name: 'Facebook',
    enabled: process.env.NEXT_PUBLIC_AUTH_FACEBOOK_ENABLED === 'true',
  },
  { id: 'apple', name: 'Apple', enabled: process.env.NEXT_PUBLIC_AUTH_APPLE_ENABLED === 'true' },
] as const;
