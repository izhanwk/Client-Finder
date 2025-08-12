import { createRequire } from "module";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const require = createRequire(import.meta.url);
const { Scraper } = require("../../../lib/scraper.cjs");

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const state = searchParams.get("state");
  const country = searchParams.get("country");
  const profession = searchParams.get("profession");

  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
    });
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const send = (data) => {
    writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  // Start streaming immediately
  send({ status: "started", message: "Your work has been started" });

  // Run scraper asynchronously so the stream stays alive
  (async () => {
    try {
      const companies = await Scraper({
        city,
        state,
        country,
        profession,
        onProgress: (update) => send(update), // optional: progress
      });

      const jsonData = JSON.stringify(companies);
      console.log("JSON companies are here : ", jsonData);
      send({ status: "done", count: companies.length, data: jsonData });
    } catch (err) {
      send({ status: "error", message: err.message });
    } finally {
      writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
