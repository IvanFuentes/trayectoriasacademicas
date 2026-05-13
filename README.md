# 🎓 Trayectorias Académicas

Una plataforma integral diseñada para el seguimiento y análisis de trayectorias académicas, permitiendo la identificación temprana de riesgos y la visualización de indicadores de desempeño estudiantil.

---

## 🚀 Características Principales

- **Dashboard Interactivo**: Visualización centralizada de datos académicos.
- **Sistema de Alerta Temprana**: Identificación proactiva de alumnos en situación de riesgo académico.
- **Indicadores Académicos**: Análisis detallado del progreso y rendimiento.
- **Gestión de Usuarios**: Control de acceso y perfiles (Administrador, Docente, Estudiante).
- **Integración con Moodle**: Sincronización de datos para un seguimiento en tiempo real.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: [Angular 20](https://angular.dev/)
- **Backend/Base de Datos**: [Supabase](https://supabase.com/)
- **Autenticación**: Supabase Auth
- **Lenguaje**: TypeScript
- **Estilos**: CSS3 Moderno

---

## 📦 Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/IvanFuentes/trayectoriasacademicas.git
    cd trayectoriasacademicas
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configuración de variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto usando `.env.example` como plantilla:
    ```bash
    cp .env.example .env
    ```
    Y completa las credenciales de Supabase:
    ```env
    VITE_SUPABASE_URL=tu_url_de_supabase
    VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
    ```

---

## 🗄️ Configuración de la Base de Datos (Supabase)

El proyecto incluye migraciones para configurar el esquema inicial. Para aplicarlas:

1. Asegúrate de tener instalado el [Supabase CLI](https://supabase.com/docs/guides/cli).
2. Ejecuta:
   ```bash
   supabase link --project-ref tu-project-id
   supabase db push
   ```

Las migraciones se encuentran en la carpeta `supabase/migrations`.

---

## 💻 Desarrollo

Para ejecutar el servidor de desarrollo:

```bash
npm start
```

Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si cambias alguno de los archivos fuente.

---

## 🏗️ Construcción (Build)

Para generar el bundle de producción:

```bash
npm run build
```

Los archivos generados se guardarán en el directorio `dist/`.

---

## 📄 Licencia

Este proyecto es para uso académico y administrativo interno. Todos los derechos reservados.
