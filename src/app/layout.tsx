
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Veloce Focus Dashboard',
  description: 'Minimalist performance dashboard for developers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-primary/30 selection:text-primary">
        <main className="min-h-screen bg-background">
          {children}
        </main>
      </body>
    </html>
  );
}
