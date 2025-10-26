
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { storageConfig, readLocalFile } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo funciona para almacenamiento local
    if (storageConfig.type !== 'local') {
      return NextResponse.json(
        { error: 'Este endpoint solo funciona con almacenamiento local' },
        { status: 400 }
      );
    }

    // Obtener la ruta del archivo
    const searchParams = req.nextUrl.searchParams;
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'Ruta de archivo no proporcionada' }, { status: 400 });
    }

    // Validar que la ruta esté dentro del directorio permitido
    if (!filePath.startsWith(storageConfig.localPath)) {
      return NextResponse.json({ error: 'Ruta de archivo inválida' }, { status: 403 });
    }

    // Leer el archivo
    const fileBuffer = await readLocalFile(filePath);
    
    // Obtener el nombre del archivo
    const fileName = filePath.split('/').pop() || 'archivo';
    
    // Determinar el tipo MIME basado en la extensión
    const extension = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
    };

    const contentType = mimeTypes[extension || ''] || 'application/octet-stream';

    // Retornar el archivo
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    return NextResponse.json(
      { error: 'Error al descargar el archivo' },
      { status: 500 }
    );
  }
}
