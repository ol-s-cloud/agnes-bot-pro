import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Agnes Bot Pro - AI Trading Automation',
  description: 'Advanced trading bot platform with AI-powered strategies, multi-broker support, and comprehensive risk management.',
  keywords: [
    'trading bot',
    'algorithmic trading',
    'AI trading',
    'automated trading',
    'forex bot',
    'crypto trading',
    'stock trading',
    'NinjaTrader',
    'Apex Trading'
  ],
  authors: [{ name: 'Agnes Bot Pro Team' }],
  creator: 'Agnes Bot Pro',
  publisher: 'Agnes Bot Pro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Agnes Bot Pro - AI Trading Automation',
    description: 'Advanced trading bot platform with AI-powered strategies and multi-broker support.',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    siteName: 'Agnes Bot Pro',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Agnes Bot Pro - AI Trading Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agnes Bot Pro - AI Trading Automation',
    description: 'Advanced trading bot platform with AI-powered strategies and multi-broker support.',
    images: ['/twitter-image.jpg'],
    creator: '@agnesbotpro',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
              },
              success: {
                style: {
                  border: '1px solid #10b981',
                },
              },
              error: {
                style: {
                  border: '1px solid #ef4444',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}