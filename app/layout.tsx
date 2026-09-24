import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { GamerProvider } from '@/components/gamer-provider';
import { AuthProvider } from '@/components/auth-provider';
import './gamer.css';

export const metadata: Metadata = {
  title: { default: 'I AM GAMER — Your next level starts here', template: '%s | I AM GAMER' },
  description:
    'Your free gaming toolkit. Train your aim, test your gear, customize your setup, and track your personal bests. No account or downloads needed.',
  applicationName: 'I AM GAMER',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          <GamerProvider>
            <AppShell>{children}</AppShell>
          </GamerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
