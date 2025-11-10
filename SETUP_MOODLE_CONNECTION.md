# Configuración de Conexión a Base de Datos Moodle

## Variables de Entorno Necesarias

Para que la Edge Function `moodle-data` funcione correctamente, debes configurar las siguientes variables de entorno en tu proyecto Supabase:

### En el Dashboard de Supabase:

1. Ve a **Project Settings** → **Environment Variables** (o Similar)
2. Agrega las siguientes variables:

```
MOODLE_DB_HOST=acad.itsescarcega.edu.mx
MOODLE_DB_PORT=5432
MOODLE_DB_USER=acaditsescarcega_ivan
MOODLE_DB_PASSWORD=BIrKehE2xDK3^4Y.
MOODLE_DB_NAME=acaditsescarcega_moodle
```

## Endpoints Disponibles

La Edge Function expone los siguientes endpoints:

### 1. Obtener Carreras
```
GET /functions/v1/moodle-data?action=carreras
```
Respuesta:
```json
[
  {
    "id": 1,
    "nombre": "Ingeniería en Sistemas Computacionales"
  },
  ...
]
```

### 2. Obtener Cursos por Carrera
```
GET /functions/v1/moodle-data?action=cursos&carrera_id=1
```
Respuesta:
```json
[
  {
    "id": 1,
    "nombre": "Programación Orientada a Objetos",
    "grupo": "S5A",
    "docente": "Dr. Juan Pérez García",
    "docenteEmail": "juan@example.com",
    "estado": "configurado"
  },
  ...
]
```

### 3. Obtener Sesiones de Asistencia
```
GET /functions/v1/moodle-data?action=sesiones-asistencia&carrera_id=1
```
Respuesta:
```json
[
  {
    "cursoId": 1,
    "cursoNombre": "Programación Orientada a Objetos",
    "grupo": "S5A",
    "docente": "Dr. Juan Pérez García",
    "sesionId": 1,
    "fecha": "2025-10-20",
    "asistenciasRegistradas": 25,
    "estado": "completado"
  },
  ...
]
```

### 4. Obtener Estudiantes con Faltas
```
GET /functions/v1/moodle-data?action=estudiantes-faltas&carrera_id=1
```
Respuesta:
```json
[
  {
    "id": 100,
    "nombre": "Ana María González Pérez",
    "matricula": "120204010",
    "email": "ana@example.com",
    "cursoNombre": "Programación Orientada a Objetos",
    "cursoId": 1,
    "faltas": 3
  },
  ...
]
```

## Seguridad

- ✅ La conexión a la base de datos es **segura** y **encriptada**
- ✅ Las credenciales están almacenadas en variables de entorno (nunca en el código)
- ✅ Solo se permite lectura de datos (**SELECT**)
- ✅ No hay exposición de credenciales en el frontend
- ✅ Todas las solicitudes pasan por la Edge Function

## Notas Importantes

1. La Edge Function maneja automáticamente CORS para permitir solicitudes desde el frontend
2. Los datos se cargan dinámicamente desde Moodle cuando se solicitan
3. Se incluye autenticación JWT para mayor seguridad
4. No hay límite de caché - los datos siempre son frescos

