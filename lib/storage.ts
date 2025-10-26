
import { promises as fs } from 'fs';
import path from 'path';
import { uploadFile as s3UploadFile, downloadFile as s3DownloadFile, deleteFile as s3DeleteFile, renameFile as s3RenameFile } from './s3';

// Configuración del tipo de almacenamiento
export const storageConfig = {
  type: (process.env.STORAGE_TYPE || 's3') as 's3' | 'local',
  localPath: process.env.LOCAL_STORAGE_PATH || './uploads',
};

// Asegurar que el directorio de almacenamiento local existe
async function ensureLocalStorageDir() {
  if (storageConfig.type === 'local') {
    try {
      await fs.access(storageConfig.localPath);
    } catch {
      await fs.mkdir(storageConfig.localPath, { recursive: true });
    }
  }
}

/**
 * Sube un archivo al sistema de almacenamiento configurado
 * @param buffer - Buffer del archivo
 * @param fileName - Nombre del archivo
 * @returns La ruta del archivo (S3 key o ruta local)
 */
export async function uploadFile(buffer: Buffer, fileName: string): Promise<string> {
  if (storageConfig.type === 's3') {
    // Subir a S3
    return await s3UploadFile(buffer, fileName);
  } else {
    // Guardar localmente
    await ensureLocalStorageDir();
    const timestamp = Date.now();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = path.join(storageConfig.localPath, `${timestamp}-${safeFileName}`);
    await fs.writeFile(filePath, buffer);
    return filePath;
  }
}

/**
 * Obtiene la URL o ruta para descargar un archivo
 * @param cloudStoragePath - Ruta del archivo (S3 key o ruta local)
 * @returns URL firmada (S3) o ruta relativa (local)
 */
export async function downloadFile(cloudStoragePath: string): Promise<string> {
  if (storageConfig.type === 's3') {
    // Obtener URL firmada de S3
    return await s3DownloadFile(cloudStoragePath);
  } else {
    // Para almacenamiento local, retornar la ruta que será servida por la API
    return `/api/files/download?path=${encodeURIComponent(cloudStoragePath)}`;
  }
}

/**
 * Elimina un archivo del sistema de almacenamiento
 * @param cloudStoragePath - Ruta del archivo
 */
export async function deleteFile(cloudStoragePath: string): Promise<void> {
  if (storageConfig.type === 's3') {
    await s3DeleteFile(cloudStoragePath);
  } else {
    try {
      await fs.unlink(cloudStoragePath);
    } catch (error) {
      console.error('Error al eliminar archivo local:', error);
    }
  }
}

/**
 * Renombra o mueve un archivo
 * @param oldPath - Ruta antigua
 * @param newFileName - Nuevo nombre de archivo
 * @returns Nueva ruta del archivo
 */
export async function renameFile(oldPath: string, newFileName: string): Promise<string> {
  if (storageConfig.type === 's3') {
    const timestamp = Date.now();
    const newKey = `uploads/${timestamp}-${newFileName}`;
    await s3RenameFile(oldPath, newKey);
    return newKey;
  } else {
    const timestamp = Date.now();
    const safeFileName = newFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const newPath = path.join(storageConfig.localPath, `${timestamp}-${safeFileName}`);
    await fs.rename(oldPath, newPath);
    return newPath;
  }
}

/**
 * Lee un archivo del almacenamiento local (solo para storage local)
 * @param cloudStoragePath - Ruta del archivo
 * @returns Buffer del archivo
 */
export async function readLocalFile(cloudStoragePath: string): Promise<Buffer> {
  if (storageConfig.type !== 'local') {
    throw new Error('Esta función solo está disponible para almacenamiento local');
  }
  return await fs.readFile(cloudStoragePath);
}

/**
 * Obtiene información sobre el tipo de almacenamiento configurado
 */
export function getStorageInfo() {
  return {
    type: storageConfig.type,
    localPath: storageConfig.type === 'local' ? storageConfig.localPath : null,
    isS3: storageConfig.type === 's3',
    isLocal: storageConfig.type === 'local',
  };
}
