
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

type Assignment = {
  id: string;
  title: string;
  description: string;
  type: string;
  maxScore: number;
  dueDate: string | null;
  createdAt: string;
  course: {
    id: string;
    title: string;
  };
  submissions: {
    id: string;
    status: string;
    score: number | null;
    submittedAt: string | null;
  }[];
};

export default function StudentAssignmentsPage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated' && session?.user?.role !== 'STUDENT') {
      router.push('/');
      return;
    }
    if (status === 'authenticated') {
      fetchAssignments();
    }
  }, [session, status, router]);

  const fetchAssignments = async () => {
    try {
      // Obtener cursos inscritos
      const enrollmentsRes = await fetch('/api/enrollments');
      if (!enrollmentsRes.ok) {
        throw new Error('Error al obtener inscripciones');
      }
      const enrollments = await enrollmentsRes.json();

      // Obtener todas las tareas de los cursos inscritos
      const allAssignments: Assignment[] = [];
      for (const enrollment of enrollments) {
        const res = await fetch(`/api/assignments?courseId=${enrollment.course.id}`);
        if (res.ok) {
          const courseAssignments = await res.json();
          allAssignments.push(...courseAssignments);
        }
      }

      setAssignments(allAssignments);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      toast.error('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      HOMEWORK: 'Tarea',
      EXAM: 'Examen',
      PROJECT: 'Proyecto',
      ESSAY: 'Ensayo',
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      HOMEWORK: 'bg-blue-100 text-blue-800',
      EXAM: 'bg-red-100 text-red-800',
      PROJECT: 'bg-purple-100 text-purple-800',
      ESSAY: 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getSubmissionStatus = (assignment: Assignment) => {
    const submission = assignment.submissions[0];
    if (!submission) {
      return { status: 'pending', label: 'Sin enviar', icon: AlertCircle, color: 'text-gray-600' };
    }
    if (submission.status === 'GRADED') {
      return { status: 'graded', label: 'Calificado', icon: CheckCircle, color: 'text-green-600' };
    }
    if (submission.status === 'SUBMITTED') {
      return { status: 'submitted', label: 'Enviado', icon: Clock, color: 'text-blue-600' };
    }
    return { status: 'pending', label: 'Sin enviar', icon: AlertCircle, color: 'text-gray-600' };
  };

  const filterAssignments = (filterType: string) => {
    return assignments.filter((assignment) => {
      const submissionStatus = getSubmissionStatus(assignment);
      switch (filterType) {
        case 'pending':
          return submissionStatus.status === 'pending';
        case 'submitted':
          return submissionStatus.status === 'submitted';
        case 'graded':
          return submissionStatus.status === 'graded';
        default:
          return true;
      }
    });
  };

  const AssignmentCard = ({ assignment }: { assignment: Assignment }) => {
    const submissionStatus = getSubmissionStatus(assignment);
    const StatusIcon = submissionStatus.icon;
    const submission = assignment.submissions[0];
    const isOverdue = assignment.dueDate && isPast(new Date(assignment.dueDate)) && !submission;

    return (
      <Card className={isOverdue ? 'border-red-300' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="flex items-center gap-2 flex-wrap">
                {assignment.title}
                <Badge className={getTypeColor(assignment.type)}>
                  {getTypeLabel(assignment.type)}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive">
                    Vencido
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {assignment.course.title}
              </CardDescription>
            </div>
            <div className={`flex items-center gap-1 ${submissionStatus.color}`}>
              <StatusIcon className="h-5 w-5" />
              <span className="text-sm font-medium">
                {submissionStatus.label}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {assignment.description}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Puntuación: {assignment.maxScore} pts</span>
            </div>
            {assignment.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Fecha límite:{' '}
                  {format(new Date(assignment.dueDate), "d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </span>
              </div>
            )}
          </div>

          {submission && submission.status === 'GRADED' && submission.score !== null && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-green-900">
                  Tu calificación:
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {submission.score}/{assignment.maxScore}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() =>
                router.push(`/student/assignments/${assignment.id}`)
              }
              className="w-full"
            >
              {submission ? 'Ver Detalles' : 'Enviar Tarea'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mis Tareas</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tus tareas y envíos
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Todas ({assignments.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendientes ({filterAssignments('pending').length})
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Enviadas ({filterAssignments('submitted').length})
          </TabsTrigger>
          <TabsTrigger value="graded">
            Calificadas ({filterAssignments('graded').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  No tienes tareas asignadas
                </p>
                <p className="text-muted-foreground">
                  Inscríbete en cursos para ver tareas
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filterAssignments('pending').length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  No tienes tareas pendientes
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filterAssignments('pending').map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          {filterAssignments('submitted').length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  No tienes tareas enviadas pendientes de calificar
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filterAssignments('submitted').map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="graded" className="space-y-4">
          {filterAssignments('graded').length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  No tienes tareas calificadas
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filterAssignments('graded').map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
