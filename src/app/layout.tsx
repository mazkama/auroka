import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { I18nProvider } from '@/presentation/i18n/I18nContext';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#004ac6',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Auroka - Pahami Uang, Bangun Masa Depan',
  description:
    'Aplikasi manajemen keuangan cerdas untuk mengelola dompet, transaksi, dan anggaran Anda secara rapi dan terencana.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [{ url: '/icon.png', sizes: '192x192', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] font-sans selection:bg-[#004ac6] selection:text-white">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
