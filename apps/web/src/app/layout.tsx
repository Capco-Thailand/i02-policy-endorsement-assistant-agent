import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/QueryProvider';

export const metadata: Metadata = {
  title: 'Policy Endorsement Assistant',
  description: 'Synthetic policy change demo',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
