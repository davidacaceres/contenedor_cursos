
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DynamicNavbar } from '@/components/dynamic-navbar';
import { CourseCatalog } from '@/components/student/course-catalog';

export default async function StudentCoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/');
  }

  // Obtener todos los cursos disponibles
  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
    },
    include: {
      instructor: {
        select: {
          name: true,
          email: true,
        },
      },
      lessons: {
        select: {
          id: true,
          duration: true,
        },
      },
      enrollments: {
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      },
      _count: {
        select: {
          lessons: true,
          enrollments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicNavbar />
      <CourseCatalog courses={courses} userId={session.user.id} />
    </div>
  );
}
