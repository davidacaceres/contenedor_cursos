
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { ModuleLessonManager } from '@/components/instructor/module-lesson-manager';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function CourseContentPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'INSTRUCTOR') {
    redirect('/auth/signin');
  }

  const course = await prisma.course.findFirst({
    where: {
      id: params.id,
      instructorId: session.user.id
    }
  });

  if (!course) {
    redirect('/instructor/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/instructor/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-600 mt-2">Gestiona los módulos y lecciones de tu curso</p>
        </div>

        <ModuleLessonManager courseId={params.id} />
      </div>
    </div>
  );
}
