
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Clock, CheckCircle2, XCircle, Trophy, AlertCircle, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Question {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  maxAttempts?: number;
  passingScore: number;
  questions: Question[];
  results: Array<{
    score: number;
    completedAt: string;
  }>;
}

export function QuizTaker({ quizId, courseId }: { quizId: string; courseId: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (hasStarted && quiz?.timeLimit && timeLeft !== null) {
      if (timeLeft <= 0) {
        handleSubmit();
        return;
      }

      const timer = setInterval(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [hasStarted, timeLeft]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`);
      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
        if (data.timeLimit) {
          setTimeLeft(data.timeLimit * 60);
        }
      }
    } catch (error) {
      console.error('Error al obtener quiz:', error);
    }
  };

  const startQuiz = () => {
    setHasStarted(true);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    // Verificar que todas las preguntas tengan respuesta
    const unanswered = quiz.questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      if (!confirm(`Tienes ${unanswered.length} preguntas sin responder. ¿Deseas enviar de todas formas?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        toast.success('Quiz enviado exitosamente');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al enviar quiz');
      }
    } catch (error) {
      toast.error('Error al enviar quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quiz) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Cargando quiz...</div>
        </CardContent>
      </Card>
    );
  }

  // Pantalla de resultados
  if (result) {
    const passed = result.passed;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {passed ? (
              <>
                <Trophy className="h-6 w-6 text-green-500" />
                ¡Felicitaciones! Has aprobado el quiz
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-orange-500" />
                Quiz Completado
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">{result.score}%</div>
                <div className="text-sm text-muted-foreground">Tu puntuación</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">{quiz.passingScore}%</div>
                <div className="text-sm text-muted-foreground">Puntuación mínima</div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Respondiste correctamente {result.correctCount} de {result.totalQuestions} preguntas
            </p>
            <Progress value={result.score} className="mb-4" />
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={() => router.push(`/student/courses/${courseId}`)}>
              Volver al Curso
            </Button>
            {!passed && quiz.maxAttempts && quiz.results.length < quiz.maxAttempts && (
              <Button variant="outline" onClick={() => window.location.reload()}>
                Intentar de Nuevo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pantalla de inicio
  if (!hasStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          {quiz.description && (
            <CardDescription>{quiz.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{quiz.questions.length}</div>
                <div className="text-sm text-muted-foreground">Preguntas</div>
              </div>
            </div>
            {quiz.timeLimit && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{quiz.timeLimit} min</div>
                  <div className="text-sm text-muted-foreground">Límite de tiempo</div>
                </div>
              </div>
            )}
            {quiz.maxAttempts && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {quiz.results.length}/{quiz.maxAttempts}
                  </div>
                  <div className="text-sm text-muted-foreground">Intentos usados</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{quiz.passingScore}%</div>
                <div className="text-sm text-muted-foreground">Para aprobar</div>
              </div>
            </div>
          </div>

          {quiz.results.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Intentos Anteriores</h4>
              <div className="space-y-1">
                {quiz.results.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>Intento {i + 1}</span>
                    <Badge variant={r.score >= quiz.passingScore ? 'default' : 'secondary'}>
                      {r.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={startQuiz}
            className="w-full"
            disabled={quiz.maxAttempts ? quiz.results.length >= quiz.maxAttempts : false}
          >
            {quiz.maxAttempts && quiz.results.length >= quiz.maxAttempts
              ? 'Sin intentos disponibles'
              : 'Comenzar Quiz'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Pantalla del quiz
  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{quiz.title}</CardTitle>
          {timeLeft !== null && (
            <Badge variant={timeLeft < 60 ? 'destructive' : 'secondary'}>
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(timeLeft)}
            </Badge>
          )}
        </div>
        <Progress value={progress} />
        <CardDescription>
          Pregunta {currentQuestion + 1} de {quiz.questions.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{question.text}</h3>
          <RadioGroup
            value={answers[question.id] || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((option) => (
                <div key={option} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted">
                  <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                  <Label htmlFor={`${question.id}-${option}`} className="flex-1 cursor-pointer">
                    {question[`option${option}` as keyof Question] as string}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            Anterior
          </Button>
          {currentQuestion < quiz.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Quiz'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
