
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Send,
  Archive,
  RotateCcw,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface CoursePublicationManagerProps {
  courseId: string;
  currentStatus: string;
  onStatusChange?: () => void;
}

interface ValidationResult {
  isValid: boolean;
  validations: {
    hasTitle: boolean;
    hasDescription: boolean;
    hasThumbnail: boolean;
    hasModules: boolean;
    hasLessons: boolean;
  };
  issues: string[];
  course: {
    id: string;
    title: string;
    status: string;
    modulesCount: number;
    lessonsCount: number;
  };
}

export function CoursePublicationManager({
  courseId,
  currentStatus,
  onStatusChange,
}: CoursePublicationManagerProps) {
  const router = useRouter();
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchValidation();
  }, [courseId]);

  const fetchValidation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}/validate`);
      if (response.ok) {
        const data = await response.json();
        setValidation(data);
      }
    } catch (error) {
      console.error('Error validando curso:', error);
      toast.error('Error al validar el curso');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setActionLoading('publish');
      const response = await fetch(`/api/courses/${courseId}/publish`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Curso publicado exitosamente');
        await fetchValidation();
        onStatusChange?.();
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al publicar el curso');
      }
    } catch (error) {
      console.error('Error publicando curso:', error);
      toast.error('Error al publicar el curso');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async () => {
    try {
      setActionLoading('unpublish');
      const response = await fetch(`/api/courses/${courseId}/publish`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Curso despublicado exitosamente');
        await fetchValidation();
        onStatusChange?.();
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al despublicar el curso');
      }
    } catch (error) {
      console.error('Error despublicando curso:', error);
      toast.error('Error al despublicar el curso');
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async () => {
    try {
      setActionLoading('archive');
      const response = await fetch(`/api/courses/${courseId}/archive`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Curso archivado exitosamente');
        await fetchValidation();
        onStatusChange?.();
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al archivar el curso');
      }
    } catch (error) {
      console.error('Error archivando curso:', error);
      toast.error('Error al archivar el curso');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnarchive = async () => {
    try {
      setActionLoading('unarchive');
      const response = await fetch(`/api/courses/${courseId}/archive`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Curso desarchivado exitosamente');
        await fetchValidation();
        onStatusChange?.();
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al desarchivar el curso');
      }
    } catch (error) {
      console.error('Error desarchivando curso:', error);
      toast.error('Error al desarchivar el curso');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (!validation) {
    return null;
  }

  const statusConfig = {
    DRAFT: {
      label: 'Borrador',
      color: 'bg-gray-500',
      description: 'El curso está en desarrollo y no es visible para los estudiantes',
    },
    PUBLISHED: {
      label: 'Publicado',
      color: 'bg-green-600',
      description: 'El curso está activo y visible para todos los estudiantes',
    },
    ARCHIVED: {
      label: 'Archivado',
      color: 'bg-yellow-600',
      description: 'El curso está archivado y no es visible para nuevos estudiantes',
    },
  };

  const status = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.DRAFT;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Estado de Publicación</CardTitle>
            <CardDescription>
              Gestiona la visibilidad y disponibilidad de tu curso
            </CardDescription>
          </div>
          <Badge className={status.color}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado Actual */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Estado Actual</AlertTitle>
          <AlertDescription>{status.description}</AlertDescription>
        </Alert>

        {/* Validaciones */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">
            Requisitos para Publicar
          </h4>
          <div className="space-y-2">
            <ValidationItem
              label="Título del curso"
              valid={validation.validations.hasTitle}
            />
            <ValidationItem
              label="Descripción del curso"
              valid={validation.validations.hasDescription}
            />
            <ValidationItem
              label="Imagen de portada"
              valid={validation.validations.hasThumbnail}
              optional
            />
            <ValidationItem
              label={`Al menos un módulo (${validation.course.modulesCount})`}
              valid={validation.validations.hasModules}
            />
            <ValidationItem
              label={`Al menos una lección (${validation.course.lessonsCount})`}
              valid={validation.validations.hasLessons}
            />
          </div>
        </div>

        {/* Issues */}
        {validation.issues.length > 0 && currentStatus === 'DRAFT' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Problemas Detectados</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2">
                {validation.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Acciones */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Acciones</h4>
          <div className="grid grid-cols-1 gap-3">
            {/* Vista previa */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push(`/courses/${courseId}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Vista Previa
            </Button>

            {/* Publicar */}
            {currentStatus === 'DRAFT' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full justify-start"
                    disabled={!validation.isValid || actionLoading !== null}
                  >
                    {actionLoading === 'publish' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Publicar Curso
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Publicar curso?</AlertDialogTitle>
                    <AlertDialogDescription>
                      El curso será visible para todos los estudiantes y podrán
                      inscribirse. Podrás seguir editando el contenido después de
                      publicarlo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePublish}>
                      Publicar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Despublicar */}
            {currentStatus === 'PUBLISHED' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === 'unpublish' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    Despublicar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Despublicar curso?</AlertDialogTitle>
                    <AlertDialogDescription>
                      El curso volverá a estado de borrador y no será visible para
                      nuevos estudiantes. Los estudiantes ya inscritos mantendrán
                      acceso.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUnpublish}>
                      Despublicar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Archivar */}
            {currentStatus === 'PUBLISHED' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-yellow-600 hover:text-yellow-700"
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === 'archive' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Archive className="h-4 w-4 mr-2" />
                    )}
                    Archivar Curso
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Archivar curso?</AlertDialogTitle>
                    <AlertDialogDescription>
                      El curso no estará disponible para nuevas inscripciones. Los
                      estudiantes actuales podrán seguir accediendo al contenido.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleArchive}>
                      Archivar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Desarchivar */}
            {currentStatus === 'ARCHIVED' && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleUnarchive}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'unarchive' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-2" />
                )}
                Desarchivar
              </Button>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Los estudiantes solo ven cursos publicados</p>
          <p>• Puedes editar cursos publicados sin problemas</p>
          <p>• Los cursos archivados mantienen estudiantes actuales</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ValidationItem({
  label,
  valid,
  optional = false,
}: {
  label: string;
  valid: boolean;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center space-x-2">
      {valid ? (
        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
      )}
      <span className="text-sm text-gray-700">
        {label}
        {optional && <span className="text-gray-500 ml-1">(opcional)</span>}
      </span>
    </div>
  );
}
