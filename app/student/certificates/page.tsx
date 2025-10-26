
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import CertificateGallery from '@/components/student/certificate-gallery';

export const metadata: Metadata = {
  title: 'Mis Certificados',
  description: 'Certificados de cursos completados'
};

export default async function CertificatesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'STUDENT') {
    redirect('/instructor/dashboard');
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <CertificateGallery />
    </div>
  );
}
