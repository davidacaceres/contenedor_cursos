
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, AlertCircle, Loader2, GraduationCap, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!role) {
      setError('Por favor selecciona tu rol');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al crear la cuenta');
        toast({
          title: 'Error',
          description: data.error || 'No se pudo crear la cuenta',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '¡Cuenta creada!',
          description: 'Ahora puedes iniciar sesión con tus credenciales',
        });
        router.push('/auth/signin');
      }
    } catch (error) {
      console.error('Error en signup:', error);
      setError('Error al crear la cuenta');
      toast({
        title: 'Error',
        description: 'Hubo un problema al crear tu cuenta',
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
          <CardTitle className="text-2xl text-center">Crear cuenta</CardTitle>
          <CardDescription className="text-center">
            Únete a nuestra plataforma de aprendizaje
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
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Tu nombre completo"
                required
                disabled={isLoading}
              />
            </div>
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
              <Label htmlFor="role">¿Cómo te registras?</Label>
              <Select value={role} onValueChange={setRole} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Estudiante - Quiero tomar cursos</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="INSTRUCTOR">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>Instructor - Quiero enseñar</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirma tu contraseña"
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
              Crear cuenta
            </Button>
            <div className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/auth/signin"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Inicia sesión aquí
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
