
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LearningPathForm from '@/components/instructor/learning-path-form';

export default async function CreateLearningPathPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'INSTRUCTOR') {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Crear Ruta de Aprendizaje</h1>
        <p className="text-muted-foreground">
          Define una secuencia estructurada de cursos para guiar a tus estudiantes
        </p>
      </div>

      <LearningPathForm mode="create" />
    </div>
  );
}
