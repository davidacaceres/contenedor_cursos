
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales inválidas');
        toast({
          title: 'Error',
          description: 'Email o contraseña incorrectos',
          variant: 'destructive',
        });
      } else if (result?.ok) {
        toast({
          title: 'Bienvenido',
          description: 'Has iniciado sesión correctamente',
        });
        // Redirect will be handled by NextAuth callback
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error en signin:', error);
      setError('Error al iniciar sesión');
      toast({
        title: 'Error',
        description: 'Hubo un problema al iniciar sesión',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Iniciar sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa a tu cuenta para continuar aprendiendo
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu-email@ejemplo.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Tu contraseña"
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar sesión
            </Button>
            <div className="text-center text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link
                href="/auth/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Regístrate aquí
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
