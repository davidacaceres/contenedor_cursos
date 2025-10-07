
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookOpen, User, LogOut, Menu, X, GraduationCap } from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                {/* Navigation Links */}
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" asChild>
                    <Link href={session.user.role === 'INSTRUCTOR' ? '/instructor/dashboard' : '/student/dashboard'}>
                      Dashboard
                    </Link>
                  </Button>
                  {session.user.role === 'STUDENT' && (
                    <Button variant="ghost" asChild>
                      <Link href="/student/courses">Cursos</Link>
                    </Button>
                  )}
                </div>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{session.user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {session.user.email}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          {session.user.role === 'INSTRUCTOR' ? (
                            <><GraduationCap className="h-3 w-3" /> Instructor</>
                          ) : (
                            <><User className="h-3 w-3" /> Estudiante</>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Iniciar sesión</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Registrarse</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t">
              {session ? (
                <>
                  <Link
                    href={session.user.role === 'INSTRUCTOR' ? '/instructor/dashboard' : '/student/dashboard'}
                    className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {session.user.role === 'STUDENT' && (
                    <Link
                      href="/student/courses"
                      className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Cursos
                    </Link>
                  )}
                  <div className="pt-4 pb-3 border-t">
                    <div className="px-3 py-2">
                      <p className="text-base font-medium text-gray-900">{session.user.name}</p>
                      <p className="text-sm text-gray-500">{session.user.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start mt-2"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesión
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-3 py-2 text-base font-medium text-blue-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
