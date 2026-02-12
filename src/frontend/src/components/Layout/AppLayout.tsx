import { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export default function AppLayout({ children, maxWidth = '2xl' }: AppLayoutProps) {
  const maxWidthClass = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  }[maxWidth];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className={`mx-auto ${maxWidthClass}`}>{children}</div>
    </div>
  );
}
