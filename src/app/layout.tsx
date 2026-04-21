import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shift Invoice Studio',
  description: 'Capture work logs, review shifts, and export polished contractor invoices.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
