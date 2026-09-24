import { AuthForm } from '@/components/auth-form';
export const metadata = { title: 'Sign in' };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return <AuthForm mode="sign-in" callbackError={params.error === 'callback'} />;
}
