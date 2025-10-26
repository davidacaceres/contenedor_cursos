
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { CourseContentViewer } from '@/components/student/course-content-viewer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function StudentCourseContentPage({ params }: { params: { id: string } }) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/student/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Mis Cursos
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{enrollment.course.title}</h1>
          <p className="text-gray-600 mt-2">{enrollment.course.description}</p>
        </div>

        <CourseContentViewer courseId={params.id} />
      </div>
    </div>
  );
}
