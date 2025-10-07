
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

export function StaticNavbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">EduPlatform</span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Iniciar sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Registrarse</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
