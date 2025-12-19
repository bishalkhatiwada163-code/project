import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
// server cron: warming/cache scheduling
import '@/server/cron';
import Navigation from '@/components/Navigation';
import AdSense from '@/components/AdSense';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SportPredict - AI-Powered Sports Predictions',
  description: 'Get live scores and AI-powered predictions for football and basketball matches',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6053627930234892"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <div className="min-h-screen relative overflow-hidden">
          {/* Animated Background Gradient */}
          <div className="fixed inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <Navigation />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {children}
          </main>

          {/* Google AdSense */}
          <AdSense />

          {/* Footer */}
          <footer className="mt-20 py-8 border-t border-white/10">
            <div className="container mx-auto px-4 text-center">
              <p className="text-gray-400 text-sm">
                © 2025 SportPredict. AI-Powered Sports Predictions.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Predictions are based on statistical analysis and should be used for entertainment purposes only.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
