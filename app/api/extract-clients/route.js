import { NextResponse } from "next/server";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { Scraper } = require("../../../lib/scraper.cjs");

export async function POST(req) {
  // const browser = await puppeteer.launch({
  //   headless: false, // So you can manually log in
  //   defaultViewport: null,
  //   args: ["--start-maximized"],
  // });

  // const page = await browser.newPage();
  // await page.goto("https://www.linkedin.com/login");

  // console.log(
  //   "🔐 Please log in manually and complete any OTP or CAPTCHA if shown."
  // );
  // console.log("⏳ Waiting 60 seconds...");

  // // Correct way to wait in Node.js
  // await new Promise((resolve) => setTimeout(resolve, 60000));

  // console.log("✅ Time up. Saving cookies...");

  // const cookies = await page.cookies();
  // fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));

  // console.log("✅ Cookies saved successfully!");
  // await browser.close();

  try {
    const body = await req.json();
    const { city, state, country, profession } = body;

    const companies = await Scraper({ city, state, country, profession });
    console.log("✅ Scraped Companies:", companies);

    return NextResponse.json({ companies }, { status: 200 });
  } catch (err) {
    console.error("❌ API route failed:", err);

    return NextResponse.json(
      {
        error: "Scraping failed",
        message: err.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
