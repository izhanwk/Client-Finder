const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");

puppeteer.use(StealthPlugin());

async function Scraper({ city, state, country, profession, onProgress }) {
  const report = typeof onProgress === "function" ? onProgress : () => {};
  const cookieLoader = async () => {
    const browser = await puppeteer.launch({
      headless: false, // So you can manually log in
      defaultViewport: null,
      args: ["--start-maximized"],
    });

    const page = await browser.newPage();
    await page.goto("https://www.linkedin.com/login");

    console.log(
      "🔐 Please log in manually and complete any OTP or CAPTCHA if shown."
    );
    console.log("⏳ Waiting 60 seconds...");

    // Correct way to wait in Node.js
    await new Promise((resolve) => setTimeout(resolve, 60000));

    console.log("✅ Time up. Saving cookies...");

    const cookies = await page.cookies();
    fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));

    console.log("✅ Cookies saved successfully!");
    await browser.close();
  };
  const webScraper = async () => {
    try {
      console.log("Started");
      report({ status: "browser-start" });

      const browser = await puppeteer.launch({
        headless: "new",
      });
      const page = await browser.newPage();

      // ✅ Load cookies from file
      const storedCookies = fs.readFileSync("cookies.json");
      console.log("reading complete");
      const cookies = JSON.parse(storedCookies);

      await page.setCookie(...cookies);
      console.log("Setting up cookies");

      await page.goto(
        "https://www.linkedin.com/jobs/search?trk=guest_homepage-basic_guest_nav_menu_jobs&position=1&pageNum=0",
        { timeout: 0 }
      );

      console.log("✅ Logged in using saved cookies");
      report({ status: "logged-in" });
      await page.setViewport({ width: 1080, height: 4000 });

      await page.screenshot({ path: "github-profile.png" });
      console.log("SS done");

      const jobField = 'input[aria-label="Search by title, skill, or company"]';
      await page.waitForSelector(jobField, { timeout: 0 });
      await page.locator(jobField).fill(profession);

      const selector = 'input[aria-label="City, state, or zip code"]';
      await page.waitForSelector(selector, { timeout: 0 });
      console.log("Found the Input Field");
      const combinations = [
        `${city}, ${state}, ${country}`, // Most specific
        `${city}, ${country}`, // Less specific
      ];

      let filled = false;

      for (const combo of combinations) {
        console.log("turn of : ", combo);
        await page.locator(selector).fill(""); // Clear previous input
        await page.locator(selector).fill(combo);

        // Wait for suggestions to show
        try {
          await page.waitForSelector(".jobs-search-box__typeahead-suggestion", {
            timeout: 3000,
          });
          console.log("Found Sugeestion");
          try {
            const innerBox = await page.waitForSelector(
              ".artdeco-inline-feedback__message",
              {
                timeout: 3000,
              }
            );

            console.log("Found inner box");
            const text = await page.evaluate((el) => el.innerText, innerBox);
            console.log(text);

            console.log("Not Worked");
            // throw new Error("This input not worked");
          } catch (error) {
            console.log("inner catch");
            console.log(`found with ${combo}`);
            report({ status: "location-selected", value: combo });
            console.log("Starting to wait for 3 seconds");
            await new Promise((resolve) => setTimeout(resolve, 3000));
            console.log("Finished waiting for 3 seconds");
            await page.screenshot({ path: "github-profile.png" });
            console.log("SS done");
            try {
              const suggestion = await page.waitForSelector(
                ".jobs-search-box__typeahead-suggestion",
                { timeout: 3000 }
              );

              await suggestion.click(); // ✅ Works in Puppeteer
              console.log("Successfully clicked");
            } catch (err) {
              console.log("Error while clicking");
              console.log(err);
            }

            console.log("Clicked the first suggestion");
            filled = true;
            console.log("Gonna break");
            break; // Exit loop once successful
          }
        } catch (e) {
          console.log("That one not found");
          console.log(e.message);
          // Continue to next combo
        }
      }
      console.log("loop ended");

      if (!filled) {
        console.warn(
          "No suggestion matched for location input:",
          city,
          state,
          country
        );
      }

      await page.waitForNavigation();
      await new Promise((resolve) => setTimeout(resolve, 5000));

      await page.screenshot({ path: "github-profile.png" });
      console.log("SS done");

      let companies = [];

      while (true) {
        const currentCompanies = await page.$$eval(
          ".artdeco-entity-lockup__subtitle",
          (elements) => elements.map((el) => el.innerText)
        );
        currentCompanies.length = currentCompanies.length - 1;

        companies.push(...currentCompanies);
        console.log("Scraped:", currentCompanies.length, "companies");
        report({
          status: "batch",
          batchCount: currentCompanies.length,
          total: companies.length,
        });

        const hasNext = await page.evaluate(() => {
          const btns = Array.from(
            document.querySelectorAll("button.artdeco-button")
          );
          const nextBtn = btns.find((btn) => btn.textContent.trim() === "Next");
          if (nextBtn && !nextBtn.disabled) {
            nextBtn.click();
            return true;
          }
          return false;
        });

        if (!hasNext) {
          console.log("No more pages.");
          report({ status: "no-more-pages" });
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      console.log(companies);
      console.log(companies.length);
      report({ status: "finished", total: companies.length });

      await browser.close();
      return companies;
    } catch (err) {
      console.error("❌ Scraper Failed with Error:", err); // Use console.error for visibility
      report({ status: "error", message: err?.message || String(err) });
      throw err; // Re-throw to let API route handle it
    }
  };
  return await webScraper();
  // await cookieLoader();
}

module.exports = { Scraper };
