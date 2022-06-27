import { serve } from "./deps.ts";

function handler(req: Request): Response {
  return new Response("Hello, World!");
}

serve(handler, {port: 4242});

