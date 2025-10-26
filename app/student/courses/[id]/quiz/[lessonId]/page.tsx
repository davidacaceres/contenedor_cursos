
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { QuizTaker } from '@/components/student/quiz-taker';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function QuizPage({ 
  params 
}: { 
  params: { id: string; lessonId: string } 
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/auth/signin');
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: params.id
      }
    },
    include: {
      course: true
    }
  });

  if (!enrollment) {
    redirect('/student/courses');
  }

  // Obtener el quiz de la lección
  const quiz = await prisma.quiz.findFirst({
    where: {
      lessonId: params.lessonId
    }
  });

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Quiz no encontrado</h2>
            <p className="text-gray-600 mt-2">No hay un quiz disponible para esta lección.</p>
            <Button asChild className="mt-4">
              <Link href={`/student/courses/${params.id}/content`}>
                Volver al Curso
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={`/student/courses/${params.id}/content`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Curso
            </Link>
          </Button>
        </div>

        <QuizTaker quizId={quiz.id} courseId={params.id} />
      </div>
    </div>
  );
}
