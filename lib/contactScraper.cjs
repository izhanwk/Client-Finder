const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { PuppeteerScreenRecorder } = require("puppeteer-screen-recorder");

const fs = require("fs");

puppeteer.use(StealthPlugin());

async function contactScraper(company, onProgress) {
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
  console.log(company);
  onProgress({
    data: `Your are inside cjs with company named ${company}`,
    status: 200,
  });

  const cScraper = async () => {
    const browser = await puppeteer.launch({
      headless: "new",
    });
    const page = await browser.newPage();

    const storedCookies = fs.readFileSync("cookies.json");
    onProgress({ status: "200", data: "Starting to search" });
    const cookies = JSON.parse(storedCookies);
    await page.setCookie(...cookies);
    onProgress({ status: "200", data: "Getting things ready" });
    await page.setViewport({ width: 1920, height: 1080 });
    const recorder = new PuppeteerScreenRecorder(page);
    await recorder.start("./demo.mp4");

    await page.goto("https://www.linkedin.com", { timeout: 60000 });
    // const searchBox = await page.waitForSelector('input[placeholder="Search"]');

    onProgress({
      status: "200",
      data: "✅ Logged in using saved cookies",
    });
    await typeLikeHuman(page, 'input[placeholder="Search"]', company);
    await page.screenshot({ path: "github-profile.png" });
    console.log("SS taken");

    await recorder.stop();
    await browser.close();
    console.log("Success");
  };
  cScraper();
}
module.exports = { contactScraper };
