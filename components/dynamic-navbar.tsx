
'use client';

import dynamic from 'next/dynamic';

const ClientNavbar = dynamic(() => import('./client-navbar').then(mod => ({ default: mod.ClientNavbar })), {
  ssr: false,
  loading: () => (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <div className="h-5 w-5 bg-white rounded"></div>
            </div>
            <span className="font-bold text-xl text-gray-900">EduPlatform</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="animate-pulse bg-gray-300 h-8 w-20 rounded"></div>
          </div>
        </div>
      </div>
    </nav>
  ),
});

export function DynamicNavbar() {
  return <ClientNavbar />;
}
