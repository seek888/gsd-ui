import { type ReactNode } from 'react';

interface WelcomeLayoutProps {
  children: ReactNode;
}

export function WelcomeLayout({ children }: WelcomeLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        {children}
      </div>
    </div>
  );
}
