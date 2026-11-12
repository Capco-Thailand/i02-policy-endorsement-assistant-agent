import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Policy Endorsement Assistant',
  description: 'Synthetic policy change demo',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
