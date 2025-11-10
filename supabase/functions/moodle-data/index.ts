import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function getClient() {
  const host = Deno.env.get("MOODLE_DB_HOST");
  const port = Deno.env.get("MOODLE_DB_PORT") || "5432";
  const user = Deno.env.get("MOODLE_DB_USER");
  const password = Deno.env.get("MOODLE_DB_PASSWORD");
  const database = Deno.env.get("MOODLE_DB_NAME");

  if (!host || !user || !password || !database) {
    throw new Error("Faltan variables de entorno. Configura MOODLE_DB_HOST, MOODLE_DB_USER, MOODLE_DB_PASSWORD, MOODLE_DB_NAME y MOODLE_DB_PORT en Supabase Dashboard.");
  }

  const client = new Client({
    hostname: host,
    port: parseInt(port),
    user,
    password,
    database,
    tls: {
      enabled: true,
      enforce: false,
      caCertificates: [],
    },
  });

  await client.connect();
  return client;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  let client: Client | null = null;

  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const action = searchParams.get("action");

    client = await getClient();

    let data: unknown;

    if (req.method === "GET") {
      if (action === "carreras") {
        data = await getCarreras(client);
      } else if (action === "cursos") {
        const carreraId = searchParams.get("carrera_id");
        if (!carreraId) throw new Error("Falta par\u00e1metro carrera_id");
        data = await getCursos(client, parseInt(carreraId));
      } else if (action === "docentes") {
        data = await getDocentes(client);
      } else if (action === "asistencias-config") {
        const cursoId = searchParams.get("curso_id");
        if (!cursoId) throw new Error("Falta par\u00e1metro curso_id");
        data = await getAsistenciasConfig(client, parseInt(cursoId));
      } else if (action === "sesiones-asistencia") {
        const carreraId = searchParams.get("carrera_id");
        if (!carreraId) throw new Error("Falta par\u00e1metro carrera_id");
        data = await getSesionesAsistencia(client, parseInt(carreraId));
      } else if (action === "estudiantes-faltas") {
        const carreraId = searchParams.get("carrera_id");
        if (!carreraId) throw new Error("Falta par\u00e1metro carrera_id");
        data = await getEstudiantesFaltas(client, parseInt(carreraId));
      } else {
        return new Response(
          JSON.stringify({ error: "Acci\u00f3n no v\u00e1lida. Opciones: carreras, cursos, docentes, asistencias-config, sesiones-asistencia, estudiantes-faltas" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: "M\u00e9todo no permitido. Solo GET" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (e) {
        console.error("Error closing connection:", e);
      }
    }
  }
});

async function getCarreras(client: Client) {
  const result = await client.queryObject(`
    SELECT id, name
    FROM tecnm_course_categories
    WHERE id NOT IN (2, 4, 8) AND parent = 0
    ORDER BY name
  `);

  return result.rows.map((row: any) => ({
    id: Number(row.id),
    nombre: row.name,
  }));
}

async function getCursos(client: Client, carreraId: number) {
  const cursos = await client.queryObject(
    `SELECT id, fullname, shortname, category 
     FROM tecnm_course 
     WHERE category = $1 AND visible = 1
     ORDER BY fullname`,
    [carreraId]
  );

  const result = [];
  for (const curso of cursos.rows) {
    const docente = await client.queryObject(
      `SELECT DISTINCT u.id, u.firstname, u.lastname, u.email, u.username
       FROM tecnm_user u 
       INNER JOIN tecnm_user_enrolments ue ON u.id = ue.userid 
       INNER JOIN tecnm_enrol e ON ue.enrolid = e.id 
       WHERE e.courseid = $1
         AND ue.status = 0
         AND e.enrol = 'manual'
       ORDER BY u.id
       LIMIT 1`,
      [(curso as any).id]
    );

    const attendance = await client.queryObject(
      `SELECT id 
       FROM tecnm_attendance 
       WHERE course = $1
       LIMIT 1`,
      [(curso as any).id]
    );

    const doc = docente.rows[0] as any;
    result.push({
      id: Number((curso as any).id),
      nombre: (curso as any).fullname,
      grupo: (curso as any).shortname,
      docente: doc ? `${doc.firstname} ${doc.lastname}` : "No asignado",
      docenteEmail: doc?.email || "",
      estado: attendance.rows.length > 0 ? "configurado" : "pendiente",
    });
  }

  return result;
}

async function getDocentes(client: Client) {
  const result = await client.queryObject(`
    SELECT DISTINCT 
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
    ORDER BY u.firstname, u.lastname
  `);
  
  return result.rows.map((row: any) => ({
    id: Number(row.id),
    nombre: `${row.firstname} ${row.lastname}`,
    username: row.username,
    email: row.email,
    cursosCount: Number(row.cursos_count),
  }));
}

async function getAsistenciasConfig(client: Client, cursoId: number) {
  const result = await client.queryObject(
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
}

async function getSesionesAsistencia(client: Client, carreraId: number) {
  const result = await client.queryObject(
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
  
  return result.rows.map((row: any) => ({
    cursoId: Number(row.curso_id),
    cursoNombre: row.curso_nombre,
    grupo: row.grupo,
    docente: row.docente || "No asignado",
    sesionId: Number(row.sesion_id),
    fecha: new Date(Number(row.sessdate) * 1000).toISOString().split("T")[0],
    asistenciasRegistradas: Number(row.asistencias_registradas),
    estado:
      Number(row.sessdate) * 1000 > Date.now()
        ? "futuro"
        : Number(row.asistencias_registradas) > 0
          ? "completado"
          : "pendiente",
  }));
}

async function getEstudiantesFaltas(client: Client, carreraId: number) {
  const result = await client.queryObject(
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
  
  return result.rows.map((row: any) => ({
    id: Number(row.id),
    nombre: row.nombre,
    matricula: row.matricula || "N/A",
    email: row.email,
    cursoNombre: row.curso,
    cursoId: Number(row.curso_id),
    faltas: Number(row.total_faltas),
  }));
}
