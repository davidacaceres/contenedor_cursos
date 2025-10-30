
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DynamicNavbar } from '@/components/dynamic-navbar';
import { CourseAnalyticsDashboard } from '@/components/instructor/course-analytics-dashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function CourseAnalyticsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'INSTRUCTOR') {
    redirect('/');
  }

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!course) {
    redirect('/instructor/dashboard');
  }

  if (course.instructorId !== session.user.id) {
    redirect('/instructor/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicNavbar />
      <div className="px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href={`/instructor/courses/${course.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al curso
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analíticas del Curso
            </h1>
            <p className="text-gray-600">
              {course.title}
            </p>
          </div>

          {/* Analytics Dashboard */}
          <CourseAnalyticsDashboard courseId={course.id} />
        </div>
      </div>
    </div>
  );
}
