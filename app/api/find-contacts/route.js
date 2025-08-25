import { createRequire } from "module";
import { getServerSession } from "next-auth";

const require = createRequire(import.meta.url);
const { contactScraper } = require("../../../lib/contactScraper.cjs");

export async function GET(req) {
  const session = await getServerSession(authOptions);

  const { searchParams } = new URL(req.url);
  const company = searchParams.get("company");
  // console.log(company);
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const send = (data) => {
    writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  if (!session) {
    send({ status: "sessionerror", data: "Session expired" });
    return writer.close();
  }

  // Kick off the scraper asynchronously so the Response is returned immediately
  (async () => {
    try {
      await contactScraper(company, (update) => {
        send(update);
      });
      send({ status: "done", message: "Completed" });
    } catch (err) {
      send({ status: "error", message: err?.message || "Unknown error" });
    } finally {
      send({ status: "progress", data: "100%" });
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
