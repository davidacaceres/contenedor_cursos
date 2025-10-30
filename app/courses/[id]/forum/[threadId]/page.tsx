
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ForumThreadDetail } from '@/components/forums/forum-thread-detail';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ThreadDetailPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;
  const threadId = params?.threadId as string;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href={`/courses/${courseId}/forum`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al foro
          </Button>
        </Link>
      </div>

      <ForumThreadDetail threadId={threadId} />
    </div>
  );
}
