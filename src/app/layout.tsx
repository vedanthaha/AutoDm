import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoDm — Instagram DM & Comment Automation',
  description: 'Automate Instagram comment-to-DM replies for Professional accounts. Built on the official Instagram Graph API.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
