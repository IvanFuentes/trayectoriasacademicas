import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Pool } from "npm:pg@8.11.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const pool = new Pool({
  host: Deno.env.get("MOODLE_DB_HOST"),
  port: parseInt(Deno.env.get("MOODLE_DB_PORT") || "5432"),
  user: Deno.env.get("MOODLE_DB_USER"),
  password: Deno.env.get("MOODLE_DB_PASSWORD"),
  database: Deno.env.get("MOODLE_DB_NAME"),
  ssl: true,
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.pathname.split("/").pop();
    const searchParams = url.searchParams;

    let data: unknown;

    if (endpoint === "moodle-data" && req.method === "GET") {
      const action = searchParams.get("action");

      if (action === "carreras") {
        data = await getCarreras();
      } else if (action === "cursos") {
        const carreraId = searchParams.get("carrera_id");
        data = await getCursos(parseInt(carreraId || "0"));
      } else if (action === "docentes") {
        data = await getDocentes();
      } else if (action === "asistencias-config") {
        const cursoId = searchParams.get("curso_id");
        data = await getAsistenciasConfig(parseInt(cursoId || "0"));
      } else if (action === "sesiones-asistencia") {
        const carreraId = searchParams.get("carrera_id");
        data = await getSesionesAsistencia(parseInt(carreraId || "0"));
      } else if (action === "estudiantes-faltas") {
        const carreraId = searchParams.get("carrera_id");
        data = await getEstudiantesFaltas(parseInt(carreraId || "0"));
      } else {
        return new Response(
          JSON.stringify({ error: "Acción no válida" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Método no permitido" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function getCarreras() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, name FROM tecnm_course_categories 
       WHERE id NOT IN (2, 4, 8) AND parent = 0
       ORDER BY name`
    );
    return result.rows.map((row: { id: number; name: string }) => ({
      id: row.id,
      nombre: row.name,
    }));
  } finally {
    client.release();
  }
}

async function getCursos(carreraId: number) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, fullname, shortname, category 
       FROM tecnm_course 
       WHERE category = $1 AND visible = 1
       ORDER BY fullname`,
      [carreraId]
    );

    const cursos = [];
    for (const curso of result.rows) {
      const docenteResult = await client.query(
        `SELECT u.id, u.firstname, u.lastname, u.email 
         FROM tecnm_user u 
         JOIN tecnm_user_enrolments ue ON u.id = ue.userid 
         JOIN tecnm_enrol e ON ue.enrolid = e.id 
         WHERE e.courseid = $1 AND ue.status = 0
         LIMIT 1`,
        [curso.id]
      );

      const docente = docenteResult.rows[0];
      const attendanceResult = await client.query(
        `SELECT id FROM tecnm_attendance WHERE course = $1 LIMIT 1`,
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
  } finally {
    client.release();
  }
}

async function getDocentes() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT DISTINCT u.id, u.firstname, u.lastname, u.email, 
              COUNT(DISTINCT e.courseid) as cursos_count 
       FROM tecnm_user u 
       JOIN tecnm_user_enrolments ue ON u.id = ue.userid 
       JOIN tecnm_enrol e ON ue.enrolid = e.id 
       WHERE ue.status = 0 AND u.id != 1
       GROUP BY u.id, u.firstname, u.lastname, u.email
       ORDER BY u.firstname, u.lastname`
    );
    return result.rows.map((row: any) => ({
      id: row.id,
      nombre: `${row.firstname} ${row.lastname}`,
      email: row.email,
      cursosCount: row.cursos_count,
    }));
  } finally {
    client.release();
  }
}

async function getAsistenciasConfig(cursoId: number) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id FROM tecnm_attendance WHERE course = $1 LIMIT 1`,
      [cursoId]
    );
    return {
      cursoId,
      configurado: result.rows.length > 0,
    };
  } finally {
    client.release();
  }
}

async function getSesionesAsistencia(carreraId: number) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT DISTINCT 
              c.id as curso_id,
              c.fullname as curso_nombre,
              c.shortname as grupo,
              u.firstname || ' ' || u.lastname as docente,
              att.id as attendance_id,
              atts.id as sesion_id,
              atts.sessdate,
              COUNT(ars.id) as asistencias_registradas
       FROM tecnm_course c
       JOIN tecnm_category cat ON c.category = cat.id
       JOIN tecnm_attendance att ON att.course = c.id
       JOIN tecnm_attendance_sessions atts ON atts.attendanceid = att.id
       LEFT JOIN tecnm_attendance_log ars ON ars.sessionid = atts.id
       JOIN tecnm_user_enrolments ue ON ue.enrolid IN (
         SELECT id FROM tecnm_enrol WHERE courseid = c.id
       )
       JOIN tecnm_user u ON u.id = ue.userid AND ue.status = 0
       WHERE c.category = $1
       GROUP BY c.id, c.fullname, c.shortname, u.firstname, u.lastname, 
                att.id, atts.id, atts.sessdate
       ORDER BY atts.sessdate DESC`,
      [carreraId]
    );
    return result.rows.map((row: any) => ({
      cursoId: row.curso_id,
      cursoNombre: row.curso_nombre,
      grupo: row.grupo,
      docente: row.docente,
      sesionId: row.sesion_id,
      fecha: new Date(row.sessdate * 1000).toISOString().split("T")[0],
      asistenciasRegistradas: row.asistencias_registradas,
      estado:
        row.sessdate * 1000 > Date.now()
          ? "futuro"
          : row.asistencias_registradas > 0
            ? "completado"
            : "pendiente",
    }));
  } finally {
    client.release();
  }
}

async function getEstudiantesFaltas(carreraId: number) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT DISTINCT
              u.id,
              u.firstname || ' ' || u.lastname as nombre,
              u.email,
              u.idnumber as matricula,
              c.fullname as curso,
              c.id as curso_id,
              cat.id as carrera_id,
              COUNT(ars.id) as total_faltas
       FROM tecnm_user u
       JOIN tecnm_user_enrolments ue ON u.id = ue.userid AND ue.status = 0
       JOIN tecnm_enrol e ON ue.enrolid = e.id
       JOIN tecnm_course c ON e.courseid = c.id
       JOIN tecnm_category cat ON c.category = cat.id
       LEFT JOIN tecnm_attendance att ON att.course = c.id
       LEFT JOIN tecnm_attendance_log ars ON ars.userid = u.id AND ars.statusid = 0
              AND ars.sessionid IN (
                SELECT id FROM tecnm_attendance_sessions WHERE attendanceid = att.id
              )
       WHERE cat.id = $1 AND ars.id IS NOT NULL
       GROUP BY u.id, u.firstname, u.lastname, u.email, u.idnumber, 
                c.fullname, c.id, cat.id
       HAVING COUNT(ars.id) >= 1
       ORDER BY total_faltas DESC, u.firstname`,
      [carreraId]
    );
    return result.rows.map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      matricula: row.matricula || "N/A",
      email: row.email,
      cursoNombre: row.curso,
      cursoId: row.curso_id,
      faltas: row.total_faltas,
    }));
  } finally {
    client.release();
  }
}
