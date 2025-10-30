
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Download, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function LearningPathCertificatePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect('/auth/signin');
  }

  // Get the certificate
  const certificate = await prisma.learningPathCertificate.findUnique({
    where: {
      userId_learningPathId: {
        userId: session.user.id,
        learningPathId: params.id,
      },
    },
    include: {
      learningPath: {
        include: {
          instructor: {
            select: {
              name: true,
            },
          },
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!certificate) {
    // Check if enrolled
    const enrollment = await prisma.learningPathEnrollment.findUnique({
      where: {
        userId_learningPathId: {
          userId: session.user.id,
          learningPathId: params.id,
        },
      },
    });

    if (!enrollment) {
      notFound();
    }

    // Not completed yet
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Link href={`/student/learning-paths/${params.id}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la Ruta
          </Button>
        </Link>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Certificado no disponible aún</h2>
            <p className="text-muted-foreground text-center">
              Completa todos los cursos requeridos en esta ruta para obtener tu certificado
            </p>
            <Link href={`/student/learning-paths/${params.id}`} className="mt-4">
              <Button>Ver Progreso</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const issueDate = new Date(certificate.issuedAt);
  const formattedDate = issueDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Link href={`/student/learning-paths/${params.id}`}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la Ruta
        </Button>
      </Link>

      <div className="mb-6 flex justify-end gap-2">
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="mr-2 h-4 w-4" />
          Descargar
        </Button>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Compartir
        </Button>
      </div>

      {/* Certificate Card */}
      <Card className="overflow-hidden print:shadow-none">
        <div className="relative bg-gradient-to-br from-primary/5 via-background to-primary/5 p-12 border-8 border-double border-primary/20">
          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-primary/30"></div>
          <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-primary/30"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-primary/30"></div>
          <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-primary/30"></div>

          <div className="text-center space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <Award className="w-20 h-20 mx-auto text-primary" />
              <h1 className="text-4xl font-serif font-bold text-primary">
                Certificado de Finalización
              </h1>
              <p className="text-lg text-muted-foreground">
                Ruta de Aprendizaje Completada
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-px bg-border flex-1 max-w-32"></div>
              <Award className="w-6 h-6 text-primary" />
              <div className="h-px bg-border flex-1 max-w-32"></div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <p className="text-lg">Se certifica que</p>
              <h2 className="text-4xl font-serif font-bold">{certificate.user.name}</h2>
              <p className="text-lg">ha completado exitosamente la ruta de aprendizaje</p>
              <h3 className="text-3xl font-semibold text-primary px-8">
                {certificate.learningPath.title}
              </h3>
              <p className="text-lg">
                impartida por <span className="font-semibold">{certificate.learningPath.instructor.name}</span>
              </p>
            </div>

            {/* Footer */}
            <div className="pt-8 space-y-4">
              <div className="flex items-center justify-center gap-4">
                <div className="h-px bg-border flex-1 max-w-48"></div>
                <div className="text-center">
                  <p className="text-sm font-semibold">{certificate.learningPath.instructor.name}</p>
                  <p className="text-xs text-muted-foreground">Instructor</p>
                </div>
                <div className="h-px bg-border flex-1 max-w-48"></div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Fecha de emisión: {formattedDate}</p>
                <p className="font-mono text-xs mt-2">
                  Código de verificación: {certificate.certificateCode}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Este certificado puede ser verificado usando el código de verificación en
        </p>
        <p className="font-semibold">
          {typeof window !== 'undefined' && window.location.origin}/verify/{certificate.certificateCode}
        </p>
      </div>
    </div>
  );
}
