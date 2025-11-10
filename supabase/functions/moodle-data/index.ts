import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Pool } from "npm:pg@8.11.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    const host = Deno.env.get("MOODLE_DB_HOST");
    const port = Deno.env.get("MOODLE_DB_PORT") || "5432";
    const user = Deno.env.get("MOODLE_DB_USER");
    const password = Deno.env.get("MOODLE_DB_PASSWORD");
    const database = Deno.env.get("MOODLE_DB_NAME");

    console.log("Configuración de conexión:", {
      host: host || "NO CONFIGURADO",
      port,
      user: user || "NO CONFIGURADO",
      database: database || "NO CONFIGURADO",
      password: password ? "CONFIGURADO" : "NO CONFIGURADO"
    });

    if (!host || !user || !password || !database) {
      throw new Error("Faltan variables de entorno de Moodle. Configura MOODLE_DB_HOST, MOODLE_DB_USER, MOODLE_DB_PASSWORD y MOODLE_DB_NAME en Supabase Dashboard.");
    }

    pool = new Pool({
      host,
      port: parseInt(port),
      user,
      password,
      database,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const action = searchParams.get("action");

    console.log("Solicitud recibida - Action:", action);

    let data: unknown;

    if (req.method === "GET") {
      if (action === "carreras") {
        data = await getCarreras();
      } else if (action === "cursos") {
        const carreraId = searchParams.get("carrera_id");
        if (!carreraId) {
          throw new Error("Falta parámetro carrera_id");
        }
        data = await getCursos(parseInt(carreraId));
      } else if (action === "docentes") {
        data = await getDocentes();
      } else if (action === "asistencias-config") {
        const cursoId = searchParams.get("curso_id");
        if (!cursoId) {
          throw new Error("Falta parámetro curso_id");
        }
        data = await getAsistenciasConfig(parseInt(cursoId));
      } else if (action === "sesiones-asistencia") {
        const carreraId = searchParams.get("carrera_id");
        if (!carreraId) {
          throw new Error("Falta parámetro carrera_id");
        }
        data = await getSesionesAsistencia(parseInt(carreraId));
      } else if (action === "estudiantes-faltas") {
        const carreraId = searchParams.get("carrera_id");
        if (!carreraId) {
          throw new Error("Falta parámetro carrera_id");
        }
        data = await getEstudiantesFaltas(parseInt(carreraId));
      } else {
        return new Response(
          JSON.stringify({ error: "Acción no válida. Acciones disponibles: carreras, cursos, docentes, asistencias-config, sesiones-asistencia, estudiantes-faltas" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Método no permitido. Solo se permite GET." }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Respuesta exitosa para action:", action);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error en Edge Function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Error desconocido",
        details: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function getCarreras() {
  const pool = getPool();
  const client = await pool.connect();
  try {
    console.log("Ejecutando query: getCarreras");
    const result = await client.query(
      `SELECT id, name 
       FROM tecnm_course_categories 
       WHERE id NOT IN (2, 4, 8) AND parent = 0
       ORDER BY name`
    );
    console.log("Carreras encontradas:", result.rows.length);
    return result.rows.map((row: { id: number; name: string }) => ({
      id: row.id,
      nombre: row.name,
    }));
  } catch (error) {
    console.error("Error en getCarreras:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function getCursos(carreraId: number) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    console.log("Ejecutando query: getCursos para carrera", carreraId);
    const result = await client.query(
      `SELECT id, fullname, shortname, category 
       FROM tecnm_course 
       WHERE category = $1 AND visible = 1
       ORDER BY fullname`,
      [carreraId]
    );

    console.log("Cursos encontrados:", result.rows.length);

    const cursos = [];
    for (const curso of result.rows) {
      const docenteResult = await client.query(
        `SELECT DISTINCT u.id, u.firstname, u.lastname, u.email, u.username
         FROM tecnm_user u 
         INNER JOIN tecnm_user_enrolments ue ON u.id = ue.userid 
         INNER JOIN tecnm_enrol e ON ue.enrolid = e.id 
         WHERE e.courseid = $1 
           AND ue.status = 0
           AND e.enrol = 'manual'
         ORDER BY u.id
         LIMIT 1`,
        [curso.id]
      );

      const docente = docenteResult.rows[0];
      
      const attendanceResult = await client.query(
        `SELECT id 
         FROM tecnm_attendance 
         WHERE course = $1 
         LIMIT 1`,
        [curso.id]
      );

      cursos.push({
        id: curso.id,
        nombre: curso.fullname,
        grupo: curso.shortname,
        docente: docente
          ? `${docente.firstname} ${docente.lastname}`
          : "No asignado",
        docenteEmail: docente?.email || "",
        estado: attendanceResult.rows.length > 0 ? "configurado" : "pendiente",
      });
    }

    return cursos;
  } catch (error) {
    console.error("Error en getCursos:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function getDocentes() {
  const pool = getPool();
  const client = await pool.connect();
  try {
    console.log("Ejecutando query: getDocentes");
    const result = await client.query(
      `SELECT DISTINCT 
              u.id, 
              u.firstname, 
              u.lastname, 
              u.email,
              u.username,
              COUNT(DISTINCT e.courseid) as cursos_count 
       FROM tecnm_user u 
       INNER JOIN tecnm_user_enrolments ue ON u.id = ue.userid 
       INNER JOIN tecnm_enrol e ON ue.enrolid = e.id 
       WHERE ue.status = 0 
         AND u.deleted = 0
         AND u.suspended = 0
       GROUP BY u.id, u.firstname, u.lastname, u.email, u.username
       HAVING COUNT(DISTINCT e.courseid) > 0
       ORDER BY u.firstname, u.lastname`
    );
    console.log("Docentes encontrados:", result.rows.length);
    return result.rows.map((row: any) => ({
      id: row.id,
      nombre: `${row.firstname} ${row.lastname}`,
      username: row.username,
      email: row.email,
      cursosCount: parseInt(row.cursos_count),
    }));
  } catch (error) {
    console.error("Error en getDocentes:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function getAsistenciasConfig(cursoId: number) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    console.log("Ejecutando query: getAsistenciasConfig para curso", cursoId);
    const result = await client.query(
      `SELECT id 
       FROM tecnm_attendance 
       WHERE course = $1 
       LIMIT 1`,
      [cursoId]
    );
    return {
      cursoId,
      configurado: result.rows.length > 0,
    };
  } catch (error) {
    console.error("Error en getAsistenciasConfig:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function getSesionesAsistencia(carreraId: number) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    console.log("Ejecutando query: getSesionesAsistencia para carrera", carreraId);
    const result = await client.query(
      `SELECT 
              c.id as curso_id,
              c.fullname as curso_nombre,
              c.shortname as grupo,
              att.id as attendance_id,
              atts.id as sesion_id,
              atts.sessdate,
              (SELECT u.firstname || ' ' || u.lastname 
               FROM tecnm_user u
               INNER JOIN tecnm_user_enrolments ue ON u.id = ue.userid
               INNER JOIN tecnm_enrol e ON ue.enrolid = e.id
               WHERE e.courseid = c.id AND ue.status = 0
               LIMIT 1) as docente,
              (SELECT COUNT(*) 
               FROM tecnm_attendance_log al 
               WHERE al.sessionid = atts.id) as asistencias_registradas
       FROM tecnm_course c
       INNER JOIN tecnm_attendance att ON att.course = c.id
       INNER JOIN tecnm_attendance_sessions atts ON atts.attendanceid = att.id
       WHERE c.category = $1 AND c.visible = 1
       ORDER BY c.fullname, atts.sessdate DESC`,
      [carreraId]
    );
    
    console.log("Sesiones encontradas:", result.rows.length);
    
    return result.rows.map((row: any) => ({
      cursoId: row.curso_id,
      cursoNombre: row.curso_nombre,
      grupo: row.grupo,
      docente: row.docente || "No asignado",
      sesionId: row.sesion_id,
      fecha: new Date(row.sessdate * 1000).toISOString().split("T")[0],
      asistenciasRegistradas: parseInt(row.asistencias_registradas),
      estado:
        row.sessdate * 1000 > Date.now()
          ? "futuro"
          : parseInt(row.asistencias_registradas) > 0
            ? "completado"
            : "pendiente",
    }));
  } catch (error) {
    console.error("Error en getSesionesAsistencia:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function getEstudiantesFaltas(carreraId: number) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    console.log("Ejecutando query: getEstudiantesFaltas para carrera", carreraId);
    const result = await client.query(
      `SELECT 
              u.id,
              u.firstname || ' ' || u.lastname as nombre,
              u.email,
              u.idnumber as matricula,
              c.fullname as curso,
              c.id as curso_id,
              COUNT(CASE WHEN al.statusid IN (1, 2) THEN 1 END) as total_faltas
       FROM tecnm_user u
       INNER JOIN tecnm_user_enrolments ue ON u.id = ue.userid
       INNER JOIN tecnm_enrol e ON ue.enrolid = e.id
       INNER JOIN tecnm_course c ON e.courseid = c.id
       INNER JOIN tecnm_attendance att ON att.course = c.id
       INNER JOIN tecnm_attendance_sessions atts ON atts.attendanceid = att.id
       LEFT JOIN tecnm_attendance_log al ON al.sessionid = atts.id AND al.studentid = u.id
       WHERE c.category = $1 
         AND ue.status = 0
         AND u.deleted = 0
         AND c.visible = 1
       GROUP BY u.id, u.firstname, u.lastname, u.email, u.idnumber, c.fullname, c.id
       HAVING COUNT(CASE WHEN al.statusid IN (1, 2) THEN 1 END) >= 1
       ORDER BY total_faltas DESC, u.firstname`,
      [carreraId]
    );
    
    console.log("Estudiantes con faltas encontrados:", result.rows.length);
    
    return result.rows.map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      matricula: row.matricula || "N/A",
      email: row.email,
      cursoNombre: row.curso,
      cursoId: row.curso_id,
      faltas: parseInt(row.total_faltas),
    }));
  } catch (error) {
    console.error("Error en getEstudiantesFaltas:", error);
    throw error;
  } finally {
    client.release();
  }
}
