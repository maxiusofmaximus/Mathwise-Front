import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { SettingsMenu } from '@/components/SettingsMenu';

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
    <html lang="en">
      <body className={inter.className}>
        <SettingsMenu />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
