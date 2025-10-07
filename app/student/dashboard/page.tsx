
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DynamicNavbar } from '@/components/dynamic-navbar';
import { StudentDashboard } from '@/components/student/student-dashboard';

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/');
  }

  // Obtener datos del estudiante
  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              instructor: true,
              lessons: true,
              _count: {
                select: {
                  lessons: true,
                },
              },
            },
          },
        },
        orderBy: {
          enrolledAt: 'desc',
        },
      },
      progress: {
        include: {
          lesson: {
            include: {
              course: true,
            },
          },
        },
      },
      quizResults: {
        include: {
          quiz: {
            include: {
              lesson: {
                include: {
                  course: true,
                },
              },
            },
          },
        },
        orderBy: {
          completedAt: 'desc',
        },
        take: 5,
      },
    },
  });

  if (!student) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicNavbar />
      <StudentDashboard student={student} />
    </div>
  );
}
