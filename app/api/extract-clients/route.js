import { createRequire } from "module";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Customers from "@/models/Customers";

const require = createRequire(import.meta.url);
const { Scraper } = require("../../../lib/scraper.cjs");

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const state = searchParams.get("state");
  const country = searchParams.get("country");
  const profession = searchParams.get("profession");
  console.log("Data from POSTMAN", city, state, country, profession);

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const send = (data) => {
    writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  const session = await getServerSession(authOptions);
  if (!session) {
    // console.log("No session");
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
    });
  }

  connectDB();
  const email = session.user.email;
  const registered = await Customers.findOne({ email: email });

  if (
    registered &&
    registered.email !== "" &&
    registered.city !== "" &&
    registered.country !== "" &&
    registered.profession !== ""
  ) {
    send({ status: "started", message: "Your work has been started" });

    (async () => {
      console.log("Started");
      try {
        const companies = await Scraper({
          city,
          state,
          country,
          profession,
          onProgress: (update) => send(update),
        });

        const jsonData = JSON.stringify(companies);
        // console.log("JSON companies are here : ", jsonData);
        send({ status: "done", count: companies.length, data: jsonData });
      } catch (err) {
        send({ status: "error", message: err.message });
      } finally {
        writer.close();
      }
    })();
  } else {
    send({
      status: "error",
      update: "Incomplete Profile",
      errorCode: 404,
    });
    await writer.close();
  }

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
