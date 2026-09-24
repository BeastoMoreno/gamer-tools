import { createBrowserClient } from '@supabase/ssr';
import { authConfigured, supabaseKey, supabaseUrl } from './config';
export function browserAuth() {
  if (!authConfigured) return null;
  return createBrowserClient(supabaseUrl, supabaseKey);
}
