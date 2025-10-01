import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../src/components/theme-provider';
import { LLMStatusProvider } from '../src/hooks/llm-status';
import { UnsupportedBrowserNotice } from '../src/components/unsupported-browser';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Private Journaling Assistant',
  description: 'A private, local-only journaling application with AI assistance',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <LLMStatusProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <UnsupportedBrowserNotice />
            {children}
          </ThemeProvider>
        </LLMStatusProvider>
      </body>
    </html>
  );
}
