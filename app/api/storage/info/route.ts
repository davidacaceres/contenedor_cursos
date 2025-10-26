
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStorageInfo } from '@/lib/storage';

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo permitir a instructores ver esta información
    if (session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'Solo instructores pueden ver esta información' },
        { status: 403 }
      );
    }

    const storageInfo = getStorageInfo();
    
    return NextResponse.json({
      success: true,
      storage: storageInfo,
    });
  } catch (error) {
    console.error('Error al obtener información de almacenamiento:', error);
    return NextResponse.json(
      { error: 'Error al obtener información de almacenamiento' },
      { status: 500 }
    );
  }
}
