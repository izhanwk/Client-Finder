import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import fs from "fs";

export async function POST(req) {
  // puppeteer.use(StealthPlugin());
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

  console.log("Started");

  const body = await req.json();
  const country = body.country;
  const state = body.state;
  const city = body.city;
  const profession = body.profession;

  const browser = await puppeteer.launch({
    headless: "new",
  });
  const page = await browser.newPage();

  // ✅ Load cookies from file

  const storedCookies = fs.readFileSync("cookies.json");
  console.log("reading complete");
  const cookies = JSON.parse(storedCookies);

  // Set cookies for the page session
  await page.setCookie(...cookies);
  console.log("Setting up cookies");

  await page.goto(
    "https://www.linkedin.com/jobs/search?trk=guest_homepage-basic_guest_nav_menu_jobs&position=1&pageNum=0"
  );

  console.log("✅ Logged in using saved cookies");
  await page.setViewport({ width: 1080, height: 4000 });

  // await page.waitForNavigation();

  await page.screenshot({ path: "github-profile.png" });
  console.log("SS done");

  const jobField = 'input[aria-label="Search by title, skill, or company"]';
  await page.waitForSelector(jobField, { timeout: 0 });
  await page.locator(jobField).fill(profession);

  const selector = 'input[aria-label="City, state, or zip code"]';

  await page.waitForSelector(selector, { timeout: 0 });

  await page.locator(selector).fill(city); // Or page.fill(selector, city)
  await page.waitForSelector(".jobs-search-box__typeahead-suggestion", {
    timeout: 0,
  });
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await page.click(".jobs-search-box__typeahead-suggestion");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // await page.reload({ waitUntil: "networkidle0" });
  // await new Promise((resolve) => setTimeout(resolve, 3000));
  await page.screenshot({ path: "github-profile.png" });
  console.log("SS done");
  // await page.locator(".jobs-search-box__typeahead-suggestion").click();

  const companies = await page.$$eval(
    ".artdeco-entity-lockup__subtitle",
    (elements) => elements.map((el) => el.innerText)
  );

  if (companies.length === 0) {
    console.log("No company found.");
    return;
  }
  companies.length = companies.length - 1;
  console.log(companies);
  for (const company of companies) {
    const page2 = await browser.newPage();
    try {
      await page2.goto("https://www.google.com", {
        timeout: 0,
        waitUntil: "networkidle0",
      });

      await page2.setViewport({ width: 1080, height: 4000 });

      await page2.type("textarea", company);
      await page2.screenshot({ path: "github-profile.png" });
      console.log("SS done");
      console.log("done and next");
    } catch (err) {
      console.error("Error processing company:", company, err);
    } finally {
      await page2.close();
    }
  }

  // companies.forEach(async (company) => {});

  await browser.close();
  return NextResponse.json({ message: "success" }, { status: 200 });
}
