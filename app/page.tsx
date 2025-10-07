
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { StaticNavbar } from '@/components/static-navbar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, GraduationCap, Trophy, Play, FileText, CheckCircle } from 'lucide-react';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Si el usuario está logueado, redirigir a su dashboard
  if (session) {
    if (session.user.role === 'INSTRUCTOR') {
      redirect('/instructor/dashboard');
    } else {
      redirect('/student/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <StaticNavbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="mx-auto max-w-6xl text-center">
          <div className="flex justify-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Aprende sin límites,
            <span className="text-blue-600"> enseña con pasión</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 leading-8">
            Conectamos instructores apasionados con estudiantes motivados en una plataforma diseñada para el éxito educativo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-3">
              <Link href="/auth/signup">Comenzar ahora</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-3">
              <Link href="/auth/signin">Iniciar sesión</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Todo lo que necesitas para aprender y enseñar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Herramientas modernas y funcionalidades completas para una experiencia educativa excepcional.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <Play className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Contenido multimedia</CardTitle>
                <CardDescription>
                  Videos, PDFs y lecciones de texto para un aprendizaje completo y variado.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Evaluaciones automáticas</CardTitle>
                <CardDescription>
                  Cuestionarios interactivos con calificación inmediata y seguimiento de progreso.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Progreso detallado</CardTitle>
                <CardDescription>
                  Visualiza tu avance con estadísticas detalladas y certificaciones de completado.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 group-hover:bg-yellow-200 transition-colors">
                  <GraduationCap className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle>Para instructores</CardTitle>
                <CardDescription>
                  Crea cursos, gestiona estudiantes y monitorea el progreso desde un panel intuitivo.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Para estudiantes</CardTitle>
                <CardDescription>
                  Accede a cursos, realiza evaluaciones y conecta con una comunidad de aprendizaje.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Interfaz moderna</CardTitle>
                <CardDescription>
                  Diseño limpio y responsivo que se adapta a todos tus dispositivos.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para transformar tu educación?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de estudiantes e instructores que ya están creando el futuro de la educación.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-3">
            <Link href="/auth/signup">Crear cuenta gratuita</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-center mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-white">EduPlatform</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 EduPlatform. Transformando la educación en línea.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
