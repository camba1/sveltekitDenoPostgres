import { serve, Pool } from "./deps.ts";

const databaseUrl = Deno.env.get("DATABASE_URL")!;


const pool = new Pool(databaseUrl, 3, true);


const connection = await pool.connect();
try {

  await connection.queryObject`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL
    )
  `;
} finally {

  connection.release();
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (url.pathname !== "/todos") {
    return new Response("Not Found", { status: 404 });
  }


  const connection = await pool.connect();

  try {
    switch (req.method) {
      case "GET": {

        const result = await connection.queryObject`
          SELECT * FROM todos
        `;


        const body = JSON.stringify(result.rows, null, 2);


        return new Response(body, {
          headers: { "content-type": "application/json" },
        });
      }
      case "POST": {


        const title = await req.json().catch(() => null);
        if (typeof title !== "string" || title.length > 256) {
          return new Response("Bad Request", { status: 400 });
        }


        await connection.queryObject`
          INSERT INTO todos (title) VALUES (${title})
        `;


        return new Response("", { status: 201 });
      }
      default:
        return new Response("Method Not Allowed", { status: 405 });
    }
  } catch (err) {
    console.error(err);

    return new Response(`Internal Server Error\n\n${err.message}`, {
      status: 500,
    });
  } finally {

    connection.release();
  }
}

serve(handler, {port: 4242});
