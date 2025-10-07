
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateCourseFormProps {
  instructorId: string;
}

export function CreateCourseForm({ instructorId }: CreateCourseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const thumbnail = formData.get('thumbnail') as string;

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          thumbnail: thumbnail || null,
          instructorId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.error || 'No se pudo crear el curso',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '¡Curso creado!',
          description: 'El curso se ha creado exitosamente',
        });
        router.push(`/instructor/courses/${data.course.id}`);
      }
    } catch (error) {
      console.error('Error creando curso:', error);
      toast({
        title: 'Error',
        description: 'Hubo un problema al crear el curso',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <div>
            <CardTitle>Información del Curso</CardTitle>
            <CardDescription>
              Proporciona la información básica de tu curso. Podrás agregar lecciones después.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Curso *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ej: Introducción a la Programación Web"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe lo que aprenderán tus estudiantes en este curso..."
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">URL de la Imagen (opcional)</Label>
            <Input
              id="thumbnail"
              name="thumbnail"
              type="url"
              placeholder="https://i.ytimg.com/vi/Q0dgfFaQqXU/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDcP1VqDShtjv0amlYQwjMovIcIJQ"
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-600">
              Proporciona una URL de imagen para el thumbnail del curso. Si no tienes una, se usará una imagen por defecto.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Curso'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
