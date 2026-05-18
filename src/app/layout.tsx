
import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';

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
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 min-h-screen bg-background overflow-auto">
            <div className="sticky top-0 z-10 flex items-center h-12 px-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            </div>
            <div className="p-6">
              {children}
            </div>
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
