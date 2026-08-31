import type { Metadata } from 'next';
import { Manrope, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/client/lib/theme';
import NextTopLoader from 'nextjs-toploader';

// Use next/font for automatic self-hosting + preloading (eliminates FOUT)
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
  preload: false, // mono is non-critical
});

export const metadata: Metadata = {
  title: {
    default: 'HackMate',
    template: '%s | HackMate',
  },
  description: 'Find the right teammates for your next hackathon.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${ibmPlexMono.variable}`}>
      <head>
        {/* DNS prefetch for Supabase to reduce auth latency */}
        <link rel="dns-prefetch" href="https://auth.supabase.io" />
        <link rel="preconnect" href="https://auth.supabase.io" crossOrigin="anonymous" />
      </head>
      <body>
        <NextTopLoader
          color="var(--accent)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px var(--accent),0 0 5px var(--accent)"
        />
        <AuthProvider>
          <QueryProvider><ThemeProvider>{children}</ThemeProvider></QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
