import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { contactScraper } = require("../../../lib/contactScraper.cjs");

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const company = searchParams.get("company");
  // console.log(company);
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const send = (data) => {
    writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  const contacts = await contactScraper(company, (update) => {
    send(update);
  });

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
