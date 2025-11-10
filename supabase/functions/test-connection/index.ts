import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const envVars = {
      MOODLE_DB_HOST: Deno.env.get("MOODLE_DB_HOST") ? "CONFIGURADO" : "NO CONFIGURADO",
      MOODLE_DB_PORT: Deno.env.get("MOODLE_DB_PORT") ? "CONFIGURADO" : "NO CONFIGURADO",
      MOODLE_DB_USER: Deno.env.get("MOODLE_DB_USER") ? "CONFIGURADO" : "NO CONFIGURADO",
      MOODLE_DB_PASSWORD: Deno.env.get("MOODLE_DB_PASSWORD") ? "CONFIGURADO" : "NO CONFIGURADO",
      MOODLE_DB_NAME: Deno.env.get("MOODLE_DB_NAME") ? "CONFIGURADO" : "NO CONFIGURADO",
    };

    const response = {
      status: "Edge Function funcionando correctamente",
      timestamp: new Date().toISOString(),
      variablesDeEntorno: envVars,
      mensaje: Object.values(envVars).every(v => v === "CONFIGURADO") 
        ? "Todas las variables est\u00e1n configuradas. La conexi\u00f3n deber\u00eda funcionar."
        : "FALTAN VARIABLES DE ENTORNO. Debes configurarlas en Supabase Dashboard > Project Settings > Edge Functions > Secrets"
    };

    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
