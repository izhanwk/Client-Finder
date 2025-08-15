const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { PuppeteerScreenRecorder } = require("puppeteer-screen-recorder");
const fs = require("fs");

puppeteer.use(StealthPlugin());

// Helper: random typing delay
function randomDelay(min = 50, max = 150) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: type text slowly like a human
async function typeLikeHuman(page, selector, text) {
  await page.click(selector, { clickCount: 3 }); // select existing text
  await page.keyboard.press("Backspace"); // clear field
  for (const char of text) {
    await page.type(selector, char, { delay: randomDelay() });
  }
}

async function Scraper({ city, state, country, profession, onProgress }) {
  const cookieLoader = async () => {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"],
    });

    const page = await browser.newPage();
    await page.goto("https://www.linkedin.com/login");

    onProgress({
      status: "progress",
      update:
        "🔐 Please log in manually and complete any OTP or CAPTCHA if shown.",
    });
    onProgress({ status: "progress", update: "⏳ Waiting 60 seconds..." });
    await new Promise((resolve) => setTimeout(resolve, 60000));

    onProgress({ status: "progress", update: "✅ Time up. Saving cookies..." });
    const cookies = await page.cookies();
    fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));
    onProgress({
      status: "progress",
      update: "✅ Cookies saved successfully!",
    });
    await browser.close();
  };

  const webScraper = async () => {
    try {
      const browser = await puppeteer.launch({
        headless: "new",
      });
      const page = await browser.newPage();

      const storedCookies = fs.readFileSync("cookies.json");
      onProgress({ status: "progress", update: "Starting to search" });
      const cookies = JSON.parse(storedCookies);
      await page.setCookie(...cookies);
      onProgress({ status: "progress", update: "Getting things ready" });

      await page.goto(
        "https://www.linkedin.com/jobs/search?trk=guest_homepage-basic_guest_nav_menu_jobs&position=1&pageNum=0",
        { timeout: 0 }
      );

      onProgress({
        status: "progress",
        update: "✅ Logged in using saved cookies",
      });
      await page.setViewport({ width: 1920, height: 1080 });

      await page.screenshot({ path: "github-profile.png" });
      const recorder = new PuppeteerScreenRecorder(page, {
        fps: 60, // Explicitly sets the output video to 60 FPS
      });
      await recorder.start("./demo.mp4");
      // Job search field
      const jobField = 'input[aria-label="Search by title, skill, or company"]';
      await page.waitForSelector(jobField, { timeout: 0 });
      await typeLikeHuman(page, jobField, profession);

      // Location field
      const selector = 'input[aria-label="City, state, or zip code"]';
      await page.waitForSelector(selector, { timeout: 0 });

      const combinations = [
        `${city}, ${state}, ${country}`,
        `${city}, ${country}`,
      ];

      let filled = false;

      for (const combo of combinations) {
        await typeLikeHuman(page, selector, combo);

        try {
          await page.waitForSelector(".jobs-search-box__typeahead-suggestion", {
            timeout: 3000,
          });
          try {
            const innerBox = await page.waitForSelector(
              ".artdeco-inline-feedback__message",
              { timeout: 3000 }
            );
            const text = await page.evaluate((el) => el.innerText, innerBox);
            onProgress({ status: "progress", update: text });
          } catch (error) {
            onProgress({
              status: "progress",
              update: "Searching for companies",
            });
            await new Promise((resolve) => setTimeout(resolve, 3000));
            await page.screenshot({ path: "github-profile.png" });
            try {
              const suggestion = await page.waitForSelector(
                ".jobs-search-box__typeahead-suggestion",
                { timeout: 3000 }
              );
              await suggestion.click();
            } catch (err) {
              onProgress({ status: "progress", update: err });
            }
            filled = true;
            break;
          }
        } catch (e) {
          onProgress({ status: "progress", update: e.message });
        }
      }

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

      let companies = [];

      const scrollPanel = async () => {
        const randomScroll = () => Math.floor(Math.random() * 800) + 500;
        const leftPanel = await page.$(
          ".oVRadhptmovrarrDfjxlalViemctuZQMUHiobA"
        );
        if (!leftPanel) return;

        for (let i = 0; i < 50; i++) {
          // safety loop
          await page.evaluate(
            (el, y) => el.scrollBy(0, y),
            leftPanel,
            randomScroll()
          );
          await page.waitForTimeout(1000 + Math.random() * 2000);

          const visibleNext = await page.$$eval(
            "button.artdeco-button",
            (btns) =>
              btns.some((btn) => {
                const rect = btn.getBoundingClientRect();
                const inViewport =
                  rect.top >= 0 &&
                  rect.left >= 0 &&
                  rect.bottom <=
                    (window.innerHeight ||
                      document.documentElement.clientHeight) &&
                  rect.right <=
                    (window.innerWidth || document.documentElement.clientWidth);
                return btn.innerText.trim() === "Next" && inViewport;
              })
          );

          if (visibleNext) {
            console.log("Next button is visible on screen");
            await page.screenshot({ path: "github-profile.png" });
            break;
          }
        }
      };

      while (true) {
        // Scroll until Next button is visible
        await scrollPanel();

        // Collect company names
        const currentCompanies = await page.$$eval(
          ".artdeco-entity-lockup__subtitle",
          (elements) => elements.map((el) => el.innerText)
        );
        currentCompanies.length = currentCompanies.length - 1; // remove last duplicate if needed
        companies.push(...currentCompanies);

        const message = `${companies.length} companies have been found`;
        onProgress({ status: "progress", update: message });

        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Check and click Next button
        const hasNext = await page.evaluate(() => {
          const btns = Array.from(
            document.querySelectorAll("button.artdeco-button")
          );
          const nextBtn = btns.find((btn) => btn.textContent.trim() === "Next");
          if (nextBtn && !nextBtn.disabled) {
            nextBtn.scrollIntoView({ behavior: "smooth", block: "center" });
            nextBtn.click();
            return true;
          }
          return false;
        });

        if (!hasNext) break;

        await page.screenshot({ path: "github-profile.png" });
        console.log("Taken");

        await new Promise((resolve) => setTimeout(resolve, 60000));
      }

      console.log("All companies collected:", companies.length);

      try {
        const inputHandle = await page.waitForSelector(
          'input[aria-label="City, state, or zip code"]',
          { timeout: 5000 }
        );
        await inputHandle.click({ clickCount: 3 });
        const inputValue = await inputHandle.evaluate((el) => el.value);

        try {
          onProgress({ status: "location", update: inputValue });
        } catch (err) {
          console.log("error while sending : ", err);
        }
      } catch (err) {
        console.log("not found the box : ", err);
      }

      onProgress({ status: "progress", update: companies.length });
      await recorder.stop();
      await browser.close();
      return companies;
    } catch (err) {
      console.error("❌ Scraper Failed with Error:", err);
      throw err;
    }
  };

  return await webScraper();
}

module.exports = { Scraper };
