
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { DynamicNavbar } from '@/components/dynamic-navbar';
import { CreateCourseForm } from '@/components/instructor/create-course-form';

export default async function CreateCoursePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'INSTRUCTOR') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicNavbar />
      <div className="px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Crear Nuevo Curso
            </h1>
            <p className="text-gray-600">
              Crea un curso completo con lecciones y evaluaciones para tus estudiantes.
            </p>
          </div>
          
          <CreateCourseForm instructorId={session.user.id} />
        </div>
      </div>
    </div>
  );
}
