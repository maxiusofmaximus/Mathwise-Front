import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.scss';
import { SettingsMenu } from '@/components/SettingsMenu';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SileoToaster } from '@/components/SileoToaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Math Quiz Platform',
  description: 'Advanced Math Quiz Platform with AI Integration',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsMenu />
          {children}
          <SileoToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
