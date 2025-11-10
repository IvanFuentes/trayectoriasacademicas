# ⚠️ CÓMO SOLUCIONAR "Error al cargar las carreras"

## El Problema

Tu aplicación muestra el error **"Error al cargar las carreras. Por favor, intente de nuevo."** porque la Edge Function de Supabase necesita las credenciales de la base de datos PostgreSQL de Moodle.

## La Solución (5 minutos)

Debes configurar 5 variables de entorno en Supabase Dashboard. Sigue estos pasos:

### 📋 Paso a Paso

1. **Abre Supabase Dashboard**
   - Ve a: https://supabase.com/dashboard
   - Inicia sesión si es necesario
   - Selecciona tu proyecto

2. **Ve a Project Settings**
   - En el menú lateral izquierdo, haz clic en el ícono de **engranaje** (⚙️)
   - Esto abrirá "Project Settings"

3. **Busca Edge Functions**
   - En el menú de Project Settings (lado izquierdo)
   - Busca y haz clic en **"Edge Functions"**

4. **Abre la pestaña Secrets**
   - Verás varias pestañas en la parte superior
   - Haz clic en **"Secrets"**

5. **Agrega las 5 Variables de Entorno**
   - Haz clic en el botón **"Add a new secret"**
   - Agrega CADA UNA de las siguientes variables:

### 🔑 Variables a Configurar

Copia y pega exactamente (incluyendo mayúsculas/minúsculas):

**Variable 1:**
```
Name: MOODLE_DB_HOST
Value: acad.itsescarcega.edu.mx
```

**Variable 2:**
```
Name: MOODLE_DB_PORT
Value: 5432
```

**Variable 3:**
```
Name: MOODLE_DB_USER
Value: acaditsescarcega_ivan
```

**Variable 4:**
```
Name: MOODLE_DB_PASSWORD
Value: BIrKehE2xDK3^4Y.
```

**Variable 5:**
```
Name: MOODLE_DB_NAME
Value: acaditsescarcega_moodle
```

### ✅ Verificación

1. Asegúrate de que las 5 variables estén guardadas en Supabase
2. Recarga tu aplicación en el navegador (presiona F5)
3. Ve a: **Alerta Temprana** → **Gestión de Asistencias**
4. Ahora deberías ver el dropdown con las carreras reales de Moodle

### ❌ Si Aún No Funciona

1. **Revisa los nombres**: Deben ser exactamente como se muestran (mayúsculas/minúsculas importan)
2. **Revisa los valores**: Cópialos completos, sin espacios al inicio o final
3. **Verifica los logs**: En Supabase Dashboard → Edge Functions → moodle-data → Logs
4. **Busca este mensaje**: "Configuración de conexión" con el estado de cada variable

### 🔍 Logs Útiles

La Edge Function imprime en los logs:
- ✅ "Configuración de conexión" - muestra si cada variable está configurada
- ✅ "Carreras encontradas: X" - indica que la consulta funcionó
- ❌ "Faltan variables de entorno de Moodle" - alguna variable falta
- ❌ Error de conexión - problema de red o credenciales

## ¿Por Qué Este Proceso?

Las variables de entorno protegen las credenciales de tu base de datos:
- ❌ NO están en el código fuente (inseguro)
- ❌ NO están en el frontend (visible al usuario)
- ✅ Están protegidas en Supabase (seguro)
- ✅ Solo la Edge Function puede acceder a ellas

## Resumen

```
Sin variables configuradas → Error "Error al cargar las carreras"
Con variables configuradas → Carreras reales de Moodle ✅
```

**Tiempo estimado**: 5 minutos
**Nivel de dificultad**: Fácil (copiar y pegar)
