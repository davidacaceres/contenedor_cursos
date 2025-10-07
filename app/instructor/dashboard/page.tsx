
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DynamicNavbar } from '@/components/dynamic-navbar';
import { InstructorDashboard } from '@/components/instructor/instructor-dashboard';

export default async function InstructorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'INSTRUCTOR') {
    redirect('/');
  }

  // Obtener datos del instructor
  const instructor = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      coursesCreated: {
        include: {
          lessons: true,
          enrollments: {
            include: {
              user: true,
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
      },
    },
  });

  if (!instructor) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicNavbar />
      <InstructorDashboard instructor={instructor} />
    </div>
  );
}
