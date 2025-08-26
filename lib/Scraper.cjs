const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { PuppeteerScreenRecorder } = require("puppeteer-screen-recorder");
const fs = require("fs");
const { resolve } = require("path");

puppeteer.use(StealthPlugin());

// Helper: random typing delay with human-like variation
function randomDelay(min = 50, max = 150) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: human-like scroll delay with natural variation
function humanScrollDelay() {
  return Math.floor(Math.random() * 400) + 200; // 200-600ms like human reading
}

// Helper: natural mouse movement delay
function naturalDelay() {
  return Math.floor(Math.random() * 150) + 100; // 100-250ms for natural movement
}

// Helper: type text slowly like a human with natural pauses
async function typeLikeHuman(page, selector, text) {
  await page.click(selector, { clickCount: 3 }); // select existing text
  await page.keyboard.press("Backspace"); // clear field

  // Add natural pause before typing
  await new Promise((resolve) => setTimeout(resolve, naturalDelay()));

  for (const char of text) {
    await page.type(selector, char, { delay: randomDelay() });
    // Occasionally add longer pauses like human thinking
    if (Math.random() < 0.1) {
      await new Promise((resolve) =>
        setTimeout(resolve, randomDelay(200, 400))
      );
    }
  }
}

// Helper: human-like scrolling with natural patterns
async function scrollLikeHuman(page) {
  // Get viewport dimensions
  const viewport = page.viewport();
  const leftHalfCenter = {
    x: viewport.width * 0.25, // center of left half
    y: viewport.height * 0.5,
  };

  // Move mouse to left half center
  await page.mouse.move(leftHalfCenter.x, leftHalfCenter.y);

  const scrollSteps = Math.floor(Math.random() * 3) + 2;

  for (let i = 0; i < scrollSteps; i++) {
    const scrollAmount = Math.floor(Math.random() * 400) + 200;

    // Simulate mouse wheel scroll
    await page.mouse.wheel({ deltaY: scrollAmount });

    console.log(`Scrolled ${scrollAmount}px in left half`);

    await new Promise((resolve) => setTimeout(resolve, humanScrollDelay()));

    if (Math.random() < 0.3) {
      await new Promise((resolve) =>
        setTimeout(resolve, randomDelay(500, 1000))
      );
    }
  }
}

// Helper: simulate human-like mouse movement
async function moveMouseNaturally(page) {
  const viewport = await page.viewport();
  const x = Math.floor(Math.random() * viewport.width);
  const y = Math.floor(Math.random() * viewport.height);

  await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 10) + 5 });
  await new Promise((resolve) => setTimeout(resolve, naturalDelay()));
}

async function Scraper({ city, state, country, profession, onProgress }) {
  // Progress tracking variables
  const TOTAL_STEPS = 25; // Total number of progress steps
  let currentStep = 0;

  // Helper: Update progress with percentage
  function updateProgress(onProgress, increment = 1) {
    currentStep += increment;
    const percentage = Math.min(
      Math.floor((currentStep / TOTAL_STEPS) * 100),
      100
    );

    onProgress({
      status: "progress",
      update: `${percentage}% complete`,
    });
  }
  const cookieLoader = async () => {
    updateProgress(onProgress, 0.5);
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

    updateProgress(onProgress, 0.5);
    const cookies = await page.cookies();
    fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));
    updateProgress(onProgress, 0.5);
    await browser.close();
  };

  async function isLoginRequired(page) {
    // Check for either the username field OR the password field
    const usernameFieldFound = await page.$("#session_key").catch(() => false);
    const passwordFieldFound = await page
      .$("#session_password")
      .catch(() => false);

    // If either field is found, login is required
    return usernameFieldFound || passwordFieldFound;
  }

  async function isLoginRequired2(page) {
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.toLowerCase().includes("sign in to view more jobs")) {
      return true;
    } else {
      return false;
    }
  }

  async function isLoginRequired3(page) {
    // Best option - very specific
    const signInButton = await page.$(
      'a.nav__button-secondary[data-tracking-control-name="public_jobs_nav-header-signin"]'
    );
    if (signInButton) {
      return true;
    } else {
      return false;
    }
  }

  const webScraper = async () => {
    try {
      const accounts = JSON.parse(process.env.LINKEDIN_ACCOUNTS);
      const max = accounts.length - 1;
      const random = Math.random() * (max - 0) + 0;
      const cookie = accounts[random].cookie;
      const proxy = accounts[random].proxy_ip;

      updateProgress(onProgress, 1);
      const browser = await puppeteer.launch({
        headless: "new",
      });
      const page = await browser.newPage();

      updateProgress(onProgress, 1);

      const storedCookies = fs.readFileSync(cookie);
      const cookies = JSON.parse(storedCookies);
      // await page.setCookie(...cookies);

      updateProgress(onProgress, 1);
      updateProgress(onProgress, 1);

      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto("https://www.linkedin.com/jobs/search", {
        timeout: 120000,
      });

      await page.screenshot({ path: "github-profile.png" });
      console.log("SS");
      const loginRequired =
        (await isLoginRequired(page)) ||
        (await isLoginRequired2(page)) ||
        (await isLoginRequired3(page));
      if (loginRequired) {
        console.log("Login needed");
        await page.goto("https://www.linkedin.com/login", {
          timeout: 120000,
        });
        // const accounts = JSON.parse(process.env.LINKEDIN_ACCOUNTS);
        // const max = accounts.length - 1;
        // const random = Math.random() * (max - 0) + 0;
        const email = accounts[random].email;
        const password = accounts[random].password;

        await typeLikeHuman(page, "#username", email);
        await typeLikeHuman(page, "#password", password);
        const loginButton = await page.$(
          "button.btn__primary--large.from__button--floating"
        );
        await new Promise((resolve) =>
          setTimeout(resolve, randomDelay(500, 900))
        );
        await loginButton.click();
        await page.waitForNavigation();
        const cookies = await page.cookies();
        fs.writeFileSync(cookie, JSON.stringify(cookies, null, 2));

        console.log("Cookies saved");
        await page.goto("https://www.linkedin.com/jobs/search", {
          timeout: 120000,
        });
        await page.screenshot({ path: "github-profile.png" });
        console.log("SS");
        return;
      }

      updateProgress(onProgress, 1);
      updateProgress(onProgress, 0.5);

      // Add natural page load delay
      try {
        updateProgress(onProgress, 0.5);
        await new Promise((resolve) => setTimeout(resolve, naturalDelay()));
      } catch (err) {
        console.log("Error ye hai k : ", err);
      }

      updateProgress(onProgress, 0.5);
      await page.screenshot({ path: "github-profile.png" });

      updateProgress(onProgress, 1);
      const recorder = new PuppeteerScreenRecorder(page, {
        fps: 60, // Explicitly sets the output video to 60 FPS
      });
      await recorder.start("./demo.mp4");

      // Job search field
      updateProgress(onProgress, 0.5);
      const jobField = 'input[aria-label="Search by title, skill, or company"]';
      await page.waitForSelector(jobField, { timeout: 0 });

      // Natural mouse movement before typing
      updateProgress(onProgress, 0.5);
      await moveMouseNaturally(page);

      updateProgress(onProgress, 1);
      await typeLikeHuman(page, jobField, profession);

      await new Promise((resolve) => setTimeout(resolve, naturalDelay()));

      // Location field
      updateProgress(onProgress, 0.5);
      const selector = 'input[aria-label="City, state, or zip code"]';
      await page.waitForSelector(selector, { timeout: 0 });

      const combinations = [
        `${city}, ${state}, ${country}`,
        `${city}, ${country}`,
      ];

      let filled = false;

      for (const combo of combinations) {
        // Natural pause between attempts
        await new Promise((resolve) => setTimeout(resolve, naturalDelay()));

        updateProgress(onProgress, 0.5);
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
            await page.evaluate((el) => el.innerText, innerBox);
            updateProgress(onProgress, 0.5);
          } catch (error) {
            updateProgress(onProgress, 0.5);

            // Natural delay before clicking suggestion
            await new Promise((resolve) =>
              setTimeout(resolve, randomDelay(1000, 2000))
            );

            updateProgress(onProgress, 0.5);
            await page.screenshot({ path: "github-profile.png" });

            try {
              const suggestion = await page.waitForSelector(
                ".jobs-search-box__typeahead-suggestion",
                { timeout: 3000 }
              );

              // Natural mouse movement before clicking
              updateProgress(onProgress, 0.5);
              await moveMouseNaturally(page);

              updateProgress(onProgress, 0.5);
              await suggestion.click();
            } catch (err) {
              updateProgress(onProgress, 0.5);
            }
            filled = true;
            break;
          }
        } catch (e) {
          updateProgress(onProgress, 0.5);
        }
      }

      if (!filled) {
        updateProgress(onProgress, 0.5);
      }

      updateProgress(onProgress, 1);
      await page.waitForNavigation();

      // Natural delay after navigation
      await new Promise((resolve) =>
        setTimeout(resolve, randomDelay(1500, 3000))
      );

      const scroll = async () => {
        let tries = 0;
        const maxTries = 30; // Increased for better coverage

        while (true) {
          // Use the new human-like scrolling function
          // updateProgress(onProgress, 0.5);
          await scrollLikeHuman(page);

          // Natural pause after scrolling
          await new Promise((resolve) =>
            setTimeout(resolve, humanScrollDelay())
          );

          try {
            // updateProgress(onProgress, 0.5);
            const nextBtn = await page.$$eval("button.artdeco-button", (btns) =>
              btns.some((btn) => {
                const text = btn.innerText.trim();
                const rect = btn.getBoundingClientRect();
                const isVisible = !!(
                  rect.width &&
                  rect.height &&
                  rect.top >= 0 && // top is visible
                  rect.bottom <= window.innerHeight && // bottom is visible
                  rect.left >= 0
                );

                return text === "Next" && !btn.disabled && isVisible;
              })
            );

            if (nextBtn) {
              // updateProgress(onProgress, 0.5);
              // Natural pause before screenshot
              await new Promise((resolve) =>
                setTimeout(resolve, naturalDelay())
              );

              // updateProgress(onProgress, 0.5);
              await page.screenshot({ path: "github-profile.png" });
              break;
            }

            await page.screenshot({ path: "github-profile.png" });
            // updateProgress(onProgress, 0.5);

            const hasNextButton = await page.evaluate(() => {
              const btn = Array.from(
                document.querySelectorAll("button.artdeco-button")
              ).find((b) => b.textContent.trim() === "Next");

              if (!btn) return false; // no Next button
              if (btn.disabled) return false; // disabled button

              const rect = btn.getBoundingClientRect();
              const viewportWidth = window.innerWidth;

              // Check if the button's center is in the left half of the viewport
              const centerX = rect.left + rect.width / 2;
              return centerX < viewportWidth / 2;
            });

            if (!hasNextButton) {
              // updateProgress(onProgress, 0.5);
              break;
            }

            // updateProgress(onProgress, 0.5);

            tries++;
            // updateProgress(onProgress, 0.2);

            if (tries > maxTries) {
              // updateProgress(onProgress, 0.5);
              break;
            }

            // Natural pause between attempts
            await new Promise((resolve) =>
              setTimeout(resolve, randomDelay(500, 1000))
            );
          } catch (err) {
            // updateProgress(onProgress, 0.5);
            break;
          }
        }
      };

      let companies = [];

      while (true) {
        await scroll();
        const currentCompanies = await page.$$eval(
          ".artdeco-entity-lockup__subtitle",
          (elements) => elements.map((el) => el.innerText)
        );
        currentCompanies.length = currentCompanies.length - 1;
        companies.push(...currentCompanies);

        // Keep the company count message as is
        const message = `${companies.length} companies have been found`;
        onProgress({ status: "progress", update: message });

        // Natural gap between pages
        const randomGap = () => {
          return Math.floor(Math.random() * 1000) + 800; // 800-1800ms
        };
        await new Promise((resolve) => setTimeout(resolve, randomGap()));

        const hasNext = await page.evaluate(() => {
          const btns = Array.from(
            document.querySelectorAll("button.artdeco-button")
          );
          const nextBtn = btns.find((btn) => btn.textContent.trim() === "Next");

          if (nextBtn && !nextBtn.disabled) {
            const rect = nextBtn.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            // Check if button is in the left half
            if (rect.left + rect.width / 2 < viewportWidth / 2) {
              nextBtn.click();
              return true; // clicked
            }
          }
          return false; // no valid "Next" button found
        });

        if (!hasNext) {
          // updateProgress(onProgress, 0.5);
          break;
        }

        // Natural delay after clicking next
        // updateProgress(onProgress, 0.5);
        await new Promise((resolve) =>
          setTimeout(resolve, randomDelay(1000, 2000))
        );
      }

      try {
        updateProgress(onProgress, 0.5);
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

      updateProgress(onProgress, 1);

      updateProgress(onProgress, 0.5);
      await recorder.stop();

      updateProgress(onProgress, 0.5);
      await browser.close();

      return companies;
    } catch (err) {
      updateProgress(onProgress, 0);
      console.error("❌ Scraper Failed with Error:", err);
      throw err;
    }
  };

  return await webScraper();
}

module.exports = { Scraper };
