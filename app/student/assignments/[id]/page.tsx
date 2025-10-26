
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, FileText, Upload, Download, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { SubmissionComments } from '@/components/submission-comments';

type Assignment = {
  id: string;
  title: string;
  description: string;
  type: string;
  maxScore: number;
  dueDate: string | null;
  isAutoGraded: boolean;
  questionsData?: any[];
  course: {
    title: string;
  };
  submissions: any[];
};

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated' && session?.user?.role !== 'STUDENT') {
      router.push('/');
      return;
    }
    if (params.id) {
      fetchAssignment();
    }
  }, [params.id, session, status, router]);

  const fetchAssignment = async () => {
    try {
      const res = await fetch(`/api/assignments/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setAssignment(data);

        // Pre-cargar datos si ya hay un envío
        const submission = data.submissions?.[0];
        if (submission) {
          setContent(submission.content || '');
          if (submission.answersData) {
            setAnswers(submission.answersData);
          }
        }
      } else {
        toast.error('Error al cargar la tarea');
        router.push('/student/assignments');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar la tarea');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('assignmentId', params.id as string);
      
      if (content) {
        formData.append('content', content);
      }

      if (file) {
        formData.append('file', file);
      }

      if (assignment?.isAutoGraded) {
        formData.append('answersData', JSON.stringify(answers));

        // Validar que todas las preguntas estén respondidas
        const questionCount = assignment.questionsData?.length || 0;
        if (Object.keys(answers).length !== questionCount) {
          toast.error('Debes responder todas las preguntas');
          setSubmitting(false);
          return;
        }
      }

      const res = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        toast.success('Tarea enviada exitosamente');
        
        if (result.score !== null && result.score !== undefined) {
          toast.success(`Calificación: ${result.score}/${assignment?.maxScore}`);
        }
        
        router.push('/student/assignments');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al enviar la tarea');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar la tarea');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadSubmission = async () => {
    const submission = assignment?.submissions?.[0];
    if (!submission?.cloud_storage_path) return;

    try {
      const res = await fetch(`/api/submissions/${submission.id}/download`);
      if (res.ok) {
        const data = await res.json();
        const a = document.createElement('a');
        a.href = data.url;
        a.target = '_blank';
        a.click();
      } else {
        toast.error('Error al descargar el archivo');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al descargar el archivo');
    }
  };

  const getStatusBadge = (submission: any) => {
    if (!submission) {
      return <Badge variant="outline">Sin enviar</Badge>;
    }

    switch (submission.status) {
      case 'GRADED':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Calificado
          </Badge>
        );
      case 'SUBMITTED':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            Enviado
          </Badge>
        );
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-lg">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  const submission = assignment.submissions?.[0];
  const isSubmitted = submission?.status === 'SUBMITTED' || submission?.status === 'GRADED';
  const isGraded = submission?.status === 'GRADED';

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="mb-6"
      >
        ← Volver
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{assignment.title}</CardTitle>
              <CardDescription className="text-base">
                {assignment.course.title}
              </CardDescription>
            </div>
            {getStatusBadge(submission)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{assignment.description}</p>

          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Puntuación: {assignment.maxScore} pts</span>
            </div>
            {assignment.dueDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Vence: {format(new Date(assignment.dueDate), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                </span>
              </div>
            )}
          </div>

          {isGraded && submission && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Calificación:</span>
                  <Badge className="text-lg px-3 py-1">
                    {submission.score}/{assignment.maxScore}
                  </Badge>
                </div>
              </div>
              {submission.feedback && (
                <div className="space-y-1">
                  <span className="font-semibold text-sm">Retroalimentación:</span>
                  <p className="text-sm text-muted-foreground border-l-2 border-primary pl-3">
                    {submission.feedback}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección de comentarios */}
      {submission && (
        <SubmissionComments submissionId={submission.id} />
      )}

      {!isGraded && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isSubmitted ? 'Tu Envío' : 'Enviar Tarea'}
            </CardTitle>
            <CardDescription>
              {isSubmitted
                ? 'Ya has enviado esta tarea. Esperando calificación.'
                : 'Completa y envía tu tarea'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignment.isAutoGraded ? (
              // Formulario de opción múltiple
              <form onSubmit={handleSubmit} className="space-y-6">
                {assignment.questionsData?.map((question, qIndex) => (
                  <Card key={qIndex}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Pregunta {qIndex + 1}
                      </CardTitle>
                      <CardDescription>{question.question}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={answers[qIndex]?.toString() || ''}
                        onValueChange={(value) =>
                          setAnswers({ ...answers, [qIndex]: parseInt(value) })
                        }
                        disabled={isSubmitted}
                      >
                        {question.options.map((option: string, oIndex: number) => (
                          <div
                            key={oIndex}
                            className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50"
                          >
                            <RadioGroupItem
                              value={oIndex.toString()}
                              id={`q${qIndex}-o${oIndex}`}
                            />
                            <Label
                              htmlFor={`q${qIndex}-o${oIndex}`}
                              className="flex-1 cursor-pointer"
                            >
                              {String.fromCharCode(65 + oIndex)}. {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                ))}

                {!isSubmitted && (
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'Enviando...' : 'Enviar Respuestas'}
                  </Button>
                )}
              </form>
            ) : (
              // Formulario tradicional con texto y archivo
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="content">Respuesta</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    placeholder="Escribe tu respuesta aquí..."
                    disabled={isSubmitted}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Archivo Adjunto (opcional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      disabled={isSubmitted}
                      className="flex-1"
                    />
                    {submission?.cloud_storage_path && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDownloadSubmission}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </Button>
                    )}
                  </div>
                  {file && (
                    <p className="text-sm text-muted-foreground">
                      Archivo seleccionado: {file.name}
                    </p>
                  )}
                </div>

                {!isSubmitted && (
                  <Button type="submit" className="w-full" disabled={submitting}>
                    <Upload className="mr-2 h-4 w-4" />
                    {submitting ? 'Enviando...' : 'Enviar Tarea'}
                  </Button>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
