# Configuración Completa - Conexión a Base de Datos Moodle

## Estado Actual

✅ **Edge Function desplegada**: `moodle-data` está activa en Supabase
✅ **Frontend configurado**: Angular con MoodleService listo
✅ **Componentes actualizados**: Gestión de Asistencias, Seguimiento del Registro, Prevención y Atención
✅ **Build exitoso**: La aplicación compila correctamente

## Paso Crítico: Configurar Variables de Entorno

Para que la conexión funcione, **DEBES** configurar las siguientes variables de entorno en el Dashboard de Supabase:

### En Supabase Dashboard:

1. Ir a: **Project Settings** → **Edge Functions** → **Secrets**
2. Agregar las siguientes secrets:

| Nombre | Valor |
|--------|-------|
| `MOODLE_DB_HOST` | `acad.itsescarcega.edu.mx` |
| `MOODLE_DB_PORT` | `5432` |
| `MOODLE_DB_USER` | `acaditsescarcega_ivan` |
| `MOODLE_DB_PASSWORD` | `BIrKehE2xDK3^4Y.` |
| `MOODLE_DB_NAME` | `acaditsescarcega_moodle` |

**IMPORTANTE**: Después de agregar los secrets, debes redesplegar la Edge Function para que tome los nuevos valores.

## Estructura de la Base de Datos Moodle

### Tablas utilizadas:

1. **`tecnm_course_categories`** - Programas de estudio (carreras)
   - `id`, `name`
   - Excluye IDs: 2, 4, 8

2. **`tecnm_course`** - Asignaturas (cursos)
   - `id`, `category`, `fullname`, `shortname`, `visible`

3. **`tecnm_user`** - Usuarios (estudiantes y docentes)
   - `id`, `firstname`, `lastname`, `email`, `idnumber`

4. **`tecnm_user_enrolments`** - Inscripciones de usuarios
   - `userid`, `enrolid`, `status`

5. **`tecnm_enrol`** - Métodos de inscripción
   - `id`, `courseid`

6. **`tecnm_attendance`** - Actividades de asistencia
   - `id`, `course`

7. **`tecnm_attendance_sessions`** - Sesiones de asistencia
   - `id`, `attendanceid`, `sessdate`

8. **`tecnm_attendance_log`** - Registro de asistencias
   - `id`, `sessionid`, `userid`, `statusid`

## Consultas SQL Implementadas

### 1. Obtener Carreras
```sql
SELECT id, name
FROM tecnm_course_categories
WHERE id NOT IN (2, 4, 8) AND parent = 0
ORDER BY name
```

### 2. Obtener Cursos por Carrera
```sql
SELECT id, fullname, shortname, category
FROM tecnm_course
WHERE category = $1 AND visible = 1
ORDER BY fullname
```

### 3. Obtener Docente del Curso
```sql
SELECT u.id, u.firstname, u.lastname, u.email
FROM tecnm_user u
JOIN tecnm_user_enrolments ue ON u.id = ue.userid
JOIN tecnm_enrol e ON ue.enrolid = e.id
WHERE e.courseid = $1 AND ue.status = 0
LIMIT 1
```

### 4. Verificar si tiene Asistencias Configuradas
```sql
SELECT id
FROM tecnm_attendance
WHERE course = $1
LIMIT 1
```

## Flujo de Datos

```
Usuario interactúa con Angular
         ↓
MoodleService hace HTTP request
         ↓
https://yxuzeeblexqpjfmnfxhy.supabase.co/functions/v1/moodle-data
         ↓
Edge Function (con secrets configurados)
         ↓
Conexión PostgreSQL a acad.itsescarcega.edu.mx:5432
         ↓
Base de datos Moodle ejecuta SELECT
         ↓
Datos regresan a través de Edge Function
         ↓
Angular muestra datos en componentes
```

## Endpoints Disponibles

### 1. GET `/functions/v1/moodle-data?action=carreras`
Retorna todas las carreras excepto IDs 2, 4, 8

### 2. GET `/functions/v1/moodle-data?action=cursos&carrera_id={id}`
Retorna todos los cursos de una carrera con su docente y estado

### 3. GET `/functions/v1/moodle-data?action=sesiones-asistencia&carrera_id={id}`
Retorna sesiones de asistencia por carrera con estado (completado/pendiente/futuro)

### 4. GET `/functions/v1/moodle-data?action=estudiantes-faltas&carrera_id={id}`
Retorna estudiantes con faltas registradas en una carrera

## Componentes Angular Actualizados

### 1. Gestión de Asistencias (`gestion-asistencias.component.ts`)
- Carga carreras dinámicamente desde Moodle
- Al seleccionar carrera, carga cursos con:
  - Nombre del curso
  - Grupo
  - Docente asignado
  - Estado (Configurado/Pendiente de Configuración)

### 2. Seguimiento del Registro (`seguimiento-registro.component.ts`)
- Carga carreras dinámicamente
- Al seleccionar carrera, carga sesiones de asistencia agrupadas por curso
- Muestra estado de cada sesión:
  - **Verde**: Asistencia registrada
  - **Rojo**: Pendiente de registro
  - **Gris**: Sesión futura

### 3. Prevención y Atención Focalizada (`prevencion-atencion.component.ts`)
- Carga carreras dinámicamente
- Al seleccionar carrera, carga estudiantes con faltas
- Clasificación por color:
  - **Gris**: 1-2 faltas (Alerta)
  - **Amarillo**: 3-4 faltas (Advertencia)
  - **Rojo**: 5+ faltas (Crítico)

## Seguridad

🔒 **Credenciales protegidas**: Nunca expuestas en el frontend
🔒 **Solo lectura**: No se permite escritura en la BD Moodle
🔒 **SSL/TLS**: Todas las conexiones son encriptadas
🔒 **JWT Auth**: Autenticación en cada petición
🔒 **CORS configurado**: Solo dominios autorizados

## Verificación

Para verificar que todo funciona:

1. Abre la aplicación en el navegador
2. Inicia sesión
3. Ve al módulo "Alerta Temprana"
4. Selecciona "Gestión de Asistencias"
5. Deberías ver las carreras reales de Moodle
6. Al hacer clic en una carrera, deberías ver los cursos reales

Si ves "Cargando carreras..." indefinidamente o errores:
- Verifica que los secrets estén configurados en Supabase
- Revisa la consola del navegador para ver errores específicos
- Verifica que la base de datos Moodle sea accesible

## Notas Importantes

⚠️ **Las variables de entorno deben configurarse manualmente en Supabase Dashboard**
⚠️ **Después de agregar secrets, redesplegar la Edge Function**
⚠️ **La conexión a PostgreSQL requiere SSL habilitado**
⚠️ **Los datos son en tiempo real - no hay caché**

## Soporte

Si encuentras errores, revisa:
1. Console del navegador (F12) para errores HTTP
2. Logs de la Edge Function en Supabase Dashboard
3. Conectividad a la base de datos Moodle
