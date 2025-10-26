
'use client';

import { use, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Award, Calendar, User, GraduationCap, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface CertificateData {
  valid: boolean;
  message?: string;
  certificate?: {
    code: string;
    studentName: string;
    courseName: string;
    instructorName: string;
    issuedAt: string;
  };
}

export default function VerifyCertificatePage({
  params
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = use(params);
  const [data, setData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyCode();
  }, [resolvedParams.code]);

  const verifyCode = async () => {
    try {
      const response = await fetch(`/api/certificates/verify/${resolvedParams.code}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error verificando:', error);
      setData({ valid: false, message: 'Error al verificar el certificado' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Verificando certificado...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center border-b bg-white">
          <div className="flex justify-center mb-4">
            {data?.valid ? (
              <div className="relative">
                <div className="absolute inset-0 animate-ping bg-green-400 rounded-full opacity-20"></div>
                <div className="relative bg-green-100 p-4 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
            ) : (
              <div className="bg-red-100 p-4 rounded-full">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-3xl">
            {data?.valid ? '✓ Certificado Válido' : '✗ Certificado No Encontrado'}
          </CardTitle>
          
          <CardDescription className="text-base mt-2">
            {data?.valid 
              ? 'Este certificado ha sido verificado exitosamente'
              : data?.message || 'No se encontró un certificado con este código'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8 pb-8">
          {data?.valid && data.certificate ? (
            <div className="space-y-6">
              {/* Información del certificado */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Detalles del Certificado
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Estudiante */}
                  <div className="flex items-start gap-3 bg-white p-4 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Estudiante</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        {data.certificate.studentName}
                      </p>
                    </div>
                  </div>

                  {/* Curso */}
                  <div className="flex items-start gap-3 bg-white p-4 rounded-lg">
                    <Award className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Curso Completado</p>
                      <p className="font-semibold text-gray-900">
                        {data.certificate.courseName}
                      </p>
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-start gap-3 bg-white p-4 rounded-lg">
                    <User className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Instructor</p>
                      <p className="font-semibold text-gray-900">
                        {data.certificate.instructorName}
                      </p>
                    </div>
                  </div>

                  {/* Fecha de emisión */}
                  <div className="flex items-start gap-3 bg-white p-4 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Fecha de Emisión</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(data.certificate.issuedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Código de verificación */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Código de Verificación:</p>
                <code className="text-lg font-mono font-bold text-blue-600 bg-white px-4 py-2 rounded block text-center">
                  {data.certificate.code}
                </code>
              </div>

              {/* Badge de autenticidad */}
              <div className="flex items-center justify-center gap-2 pt-4">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Certificado Auténtico
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">
                El código proporcionado no corresponde a ningún certificado emitido.
              </p>
              <p className="text-sm text-gray-500">
                Verifica que hayas ingresado el código correctamente o contacta al portador del certificado.
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t flex justify-center">
            <Button asChild variant="outline">
              <Link href="/">
                Volver al inicio
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
