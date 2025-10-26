
# Guía de Configuración de Almacenamiento de Archivos

Este sistema soporta dos tipos de almacenamiento para archivos de envíos de tareas:

## 1. Almacenamiento en AWS S3 (Nube)

### Configuración

En el archivo `.env`, configura las siguientes variables:

```env
# Tipo de almacenamiento
STORAGE_TYPE=s3

# Configuración de AWS S3
AWS_PROFILE=hosted_storage
AWS_REGION=us-west-2
AWS_BUCKET_NAME=tu-bucket-nombre
AWS_FOLDER_PREFIX=tu-prefijo/
```

### Ventajas
- ✅ Escalable y confiable
- ✅ No consume espacio en el servidor
- ✅ URLs firmadas con expiración para seguridad
- ✅ Ideal para producción

### Desventajas
- ❌ Requiere configuración de AWS
- ❌ Costos asociados al uso de S3

## 2. Almacenamiento Local (Disco Duro)

### Configuración

En el archivo `.env`, configura las siguientes variables:

```env
# Tipo de almacenamiento
STORAGE_TYPE=local

# Ruta local donde se guardarán los archivos
LOCAL_STORAGE_PATH=./uploads
```

### Rutas Soportadas

Puedes usar rutas absolutas o relativas:

#### Rutas Relativas (recomendado para desarrollo)
```env
LOCAL_STORAGE_PATH=./uploads
LOCAL_STORAGE_PATH=./data/files
LOCAL_STORAGE_PATH=../shared-storage
```

#### Rutas Absolutas
```env
# Linux/Mac
LOCAL_STORAGE_PATH=/var/www/plataforma/uploads
LOCAL_STORAGE_PATH=/home/usuario/archivos

# Windows
LOCAL_STORAGE_PATH=C:/plataforma/uploads
LOCAL_STORAGE_PATH=D:/datos/archivos
```

### Ventajas
- ✅ No requiere servicios externos
- ✅ Sin costos adicionales
- ✅ Más rápido para desarrollo
- ✅ Control total sobre los archivos

### Desventajas
- ❌ Consume espacio en el servidor
- ❌ No escalable fácilmente
- ❌ Requiere backups manuales
- ❌ Limitado al espacio disponible en disco

## Cambiar entre Tipos de Almacenamiento

### De S3 a Local

1. Edita `.env`:
```env
STORAGE_TYPE=local
LOCAL_STORAGE_PATH=./uploads
```

2. Reinicia el servidor:
```bash
yarn dev
```

3. Los archivos nuevos se guardarán localmente. Los archivos antiguos en S3 seguirán accesibles hasta que cambies el tipo nuevamente.

### De Local a S3

1. Edita `.env`:
```env
STORAGE_TYPE=s3
AWS_BUCKET_NAME=tu-bucket
AWS_REGION=us-west-2
```

2. Reinicia el servidor:
```bash
yarn dev
```

3. Los archivos nuevos se guardarán en S3. Los archivos locales seguirán en disco.

## Migración de Archivos

Si necesitas migrar archivos existentes de un tipo de almacenamiento a otro, necesitarás:

1. **Exportar referencias de la base de datos**
2. **Copiar archivos físicos**
3. **Actualizar las rutas en la base de datos**

Esto requiere un script personalizado que no está incluido en el sistema base.

## Permisos y Seguridad

### Almacenamiento Local

Asegúrate de que:
- El directorio tenga permisos de escritura para el proceso de Node.js
- El directorio NO sea accesible directamente vía web
- Los archivos se sirvan solo a través del endpoint `/api/files/download`

```bash
# Linux/Mac - Establecer permisos
mkdir -p ./uploads
chmod 755 ./uploads
```

### Almacenamiento S3

Asegúrate de que:
- El bucket tenga políticas de acceso correctas
- Las credenciales de AWS estén configuradas
- El perfil AWS tenga permisos de lectura/escritura

## Verificar Configuración Actual

Puedes verificar qué tipo de almacenamiento está activo haciendo una petición a:

```
GET /api/storage/info
```

Requiere autenticación como instructor.

Respuesta:
```json
{
  "success": true,
  "storage": {
    "type": "local",
    "localPath": "./uploads",
    "isS3": false,
    "isLocal": true
  }
}
```

## Recomendaciones

- **Desarrollo/Testing**: Usa almacenamiento local
- **Producción**: Usa S3 o servicio de almacenamiento en nube
- **Servidor único pequeño**: Almacenamiento local puede ser suficiente
- **Múltiples servidores**: S3 es necesario para compartir archivos

## Troubleshooting

### Error: "Cannot write to local directory"
- Verifica permisos del directorio
- Asegúrate de que la ruta existe o puede ser creada

### Error: "S3 bucket not found"
- Verifica que AWS_BUCKET_NAME esté correctamente configurado
- Verifica credenciales de AWS

### Archivos no se descargan
- Para local: Verifica que el endpoint `/api/files/download` esté funcionando
- Para S3: Verifica que las credenciales permitan generar URLs firmadas
