
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Award, Calendar, User, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateCertificatePDF } from '@/lib/certificate-generator';

interface Certificate {
  id: string;
  certificateCode: string;
  issuedAt: string;
  course: {
    title: string;
    instructor: {
      name: string;
    };
  };
  user: {
    name: string;
  };
}

export default function CertificateGallery() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/certificates');
      if (response.ok) {
        const data = await response.json();
        setCertificates(data);
      }
    } catch (error) {
      console.error('Error cargando certificados:', error);
      toast.error('Error al cargar certificados');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificate: Certificate) => {
    try {
      const pdf = generateCertificatePDF({
        studentName: certificate.user.name || 'Estudiante',
        courseName: certificate.course.title,
        instructorName: certificate.course.instructor.name || 'Instructor',
        completionDate: new Date(certificate.issuedAt),
        certificateCode: certificate.certificateCode
      });

      pdf.save(`Certificado-${certificate.course.title.replace(/\s+/g, '-')}.pdf`);
      toast.success('Certificado descargado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('Error al generar el certificado');
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Award className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Aún no tienes certificados
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            Completa tus cursos al 100% para obtener certificados que validen tus conocimientos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Award className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Mis Certificados</h2>
        <Badge variant="secondary" className="ml-2">
          {certificates.length} {certificates.length === 1 ? 'Certificado' : 'Certificados'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert) => (
          <Card key={cert.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100 border-b">
              <div className="flex items-start justify-between">
                <Award className="h-8 w-8 text-blue-600" />
                <Badge variant="outline" className="bg-white">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completado
                </Badge>
              </div>
              <CardTitle className="mt-4 text-lg line-clamp-2">
                {cert.course.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Instructor: {cert.course.instructor.name}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(cert.issuedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500 mb-2">Código de verificación:</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded block font-mono">
                  {cert.certificateCode}
                </code>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleDownload(cert)}
                  className="flex-1"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
