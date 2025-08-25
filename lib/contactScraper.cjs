const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { PuppeteerScreenRecorder } = require("puppeteer-screen-recorder");

const fs = require("fs");
const { default: path } = require("path");

puppeteer.use(StealthPlugin());

async function contactScraper(company, onProgress) {
  try {
    // Input validation
    onProgress({
      data: `1%`,
      status: "progress",
    });
    if (!company || typeof company !== "string") {
      onProgress({
        status: 400,
        data: "Invalid company parameter provided",
      });
      return contactScraper;
    }

    if (!onProgress || typeof onProgress !== "function") {
      console.error("onProgress callback is required");
      return contactScraper;
    }

    function randomDelay(min = 50, max = 150) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Helper: type text slowly like a human
    async function typeLikeHuman(page, selector, text) {
      try {
        await page.click(selector, { clickCount: 3 }); // select existing text
        await page.keyboard.press("Backspace"); // clear field
        for (const char of text) {
          await page.type(selector, char, { delay: randomDelay() });
        }
      } catch (err) {
        console.error("Error in typeLikeHuman:", err.message);
        throw err;
      }
    }

    console.log(company);
    onProgress({
      data: `5%`,
      status: "progress",
    });

    const cScraper = async () => {
      let browser = null;
      let page = null;
      let page2 = null;
      let recorder = null;

      try {
        // Launch browser
        browser = await puppeteer.launch({
          headless: "new",
        });
        onProgress({
          data: `7%`,
          status: "progress",
        });

        page = await browser.newPage();

        onProgress({
          data: `10%`,
          status: "progress",
        });

        // Read and set cookies
        try {
          const storedCookies = fs.readFileSync("cookies.json");
          onProgress({ status: "200", data: "Starting to search" });
          const cookies = JSON.parse(storedCookies);
          await page.setCookie(...cookies);
          onProgress({
            data: `13%`,
            status: "progress",
          });
        } catch (err) {
          console.error("Error reading cookies:", err.message);
          onProgress({ status: "500", data: "Failed to load cookies" });
          return;
        }

        onProgress({ status: "200", data: "Getting things ready" });
        await page.setViewport({ width: 1920, height: 1080 });

        // Initialize recorder
        try {
          recorder = new PuppeteerScreenRecorder(page);
          await recorder.start("./demo.mp4");
        } catch (err) {
          console.error("Error starting recorder:", err.message);
          // Continue without recording
        }

        onProgress({
          data: `15%`,
          status: "progress",
        });

        // Navigate to LinkedIn
        try {
          await page.goto("https://www.linkedin.com", { timeout: 60000 });
          onProgress({
            data: `Searching Sources`,
            status: "progress",
          });
          onProgress({
            data: `25%`,
            status: "progress",
          });
        } catch (err) {
          console.error("Error navigating to LinkedIn:", err.message);
          onProgress({ status: "500", data: "Failed to access LinkedIn" });
          return;
        }

        // Type company name
        try {
          await typeLikeHuman(page, 'input[placeholder="Search"]', company);
          await new Promise((resolve) => setTimeout(resolve, 3000));
        } catch (err) {
          console.error("Error typing company name:", err.message);
          onProgress({ status: "500", data: "Failed to search for company" });
          return;
        }

        await page.screenshot({ path: "github-profile.png" });
        console.log("SS taken");
        onProgress({
          data: `28%`,
          status: "progress",
        });

        // Wait for suggestions and click
        try {
          const suggestion = await page.waitForSelector(
            ".search-global-typeahead-hit__info.truncate",
            { timeout: 5000 }
          );
          await suggestion.click();
          await page.waitForNavigation();
          await new Promise((resolve) =>
            setTimeout(resolve, randomDelay(1000, 3000))
          );
          onProgress({
            data: `34%`,
            status: "progress",
          });
        } catch (err) {
          console.error("Error finding/clicking suggestion:", err.message);
          onProgress({ status: "404", data: "No search suggestions found" });
          return;
        }

        // Find and click company
        try {
          const smallcaseCompany = company.trim().toLowerCase();
          const clickCompany = await page.evaluateHandle((targetText) => {
            const links = document.querySelectorAll("a");
            for (const link of links) {
              if (link.textContent.trim().toLowerCase() === targetText) {
                return link;
              }
            }
            return null;
          }, smallcaseCompany);

          if (!clickCompany) {
            console.error("Company not found in search results");
            onProgress({
              status: "404",
              data: "Company not found in search results",
            });
            return;
          }

          await clickCompany.click();
          await page.waitForNavigation();
          onProgress({
            data: `40%`,
            status: "progress",
          });
        } catch (err) {
          console.error("Error while clicking company:", err.message);
          onProgress({
            status: 402,
            data: "Error while finding company details",
          });
          return;
        }

        // Find About link
        try {
          const aboutLink = await page.evaluateHandle(() => {
            const elements = Array.from(document.querySelectorAll("a"));
            return elements.find(
              (el) =>
                el.textContent &&
                el.textContent.trim().toLowerCase() === "about"
            );
          });
          onProgress({
            data: `45%`,
            status: "progress",
          });

          if (!aboutLink) {
            console.error("About link not found");
            onProgress({ status: "404", data: "About section not found" });
            return;
          }

          console.log("✅ Found About link by text content");
          await aboutLink.click();
          await page.waitForNavigation();
          await new Promise((resolve) =>
            setTimeout(resolve, randomDelay(1000, 4000))
          );
          onProgress({
            data: `50%`,
            status: "progress",
          });
        } catch (err) {
          console.error("Error finding About link:", err.message);
          onProgress({ status: "500", data: "Failed to access About section" });
          return;
        }

        // Extract external links
        try {
          const links = await page.$$eval('a[href^="https"]', (as) =>
            as.map((a) => a.href)
          );
          const externalLinks = links.filter(
            (url) =>
              !url.startsWith("https://www.linkedin.com") &&
              !url.startsWith("https://www.bing.com") &&
              !url.includes("www.bing")
          );

          if (externalLinks.length === 0) {
            console.error("No external website found");
            onProgress({ status: "404", data: "No company website found" });
            return;
          }

          const website = externalLinks[0];
          onProgress({ status: "Company Website", data: website });
          const websiteString = website.trim();
          onProgress({
            data: `55%`,
            status: "progress",
          });

          // Create new page for website
          page2 = await browser.newPage();

          // Set viewport for page2 to ensure desktop view
          await page2.setViewport({ width: 1920, height: 1080 });
          onProgress({
            data: `58%`,
            status: "progress",
          });

          console.log("This is web string : ", websiteString);
          // onProgress({
          //   data: `75%`,
          //   status: "progress",
          // });
          // Navigate to company website
          try {
            await page2.goto(websiteString, {
              waitUntil: "networkidle0",
              timeout: 120000,
            });

            onProgress({
              data: `65%`,
              status: "progress",
            });

            onProgress({
              status: "200",
              data: "Accessed the company website",
            });
            // onProgress({
            //   data: `80%`,
            //   status: "progress",
            // });
          } catch (err) {
            console.error("Error accessing company website:", err.message);
            onProgress({
              status: "500",
              data: "Failed to access company website",
            });
            return;
          }
          const targetTexts = ["contact", "Contact Us", "contact sales"];
          try {
            const foundElement = await page2.evaluateHandle((targetTexts) => {
              const elements = document.querySelectorAll(
                "a, button, div[role='button']"
              );
              for (let el of elements) {
                let text = el.innerText?.toLowerCase().trim();
                if (text) {
                  for (let target of targetTexts) {
                    if (text.includes(target)) {
                      return el;
                    }
                  }
                }
              }
              return null;
            }, targetTexts);

            // Convert JSHandle to element
            const element = foundElement.asElement();
            console.log("This is the element i got : ", element);

            if (!element) {
              console.log("⚠️ No Contact/About button found");
              return;
            }
            console.log(
              "The button text : ",
              await element.evaluate((el) => el.innerText)
            );

            // const info = await element.evaluate((el) => ({
            //   tagName: el.tagName.toLowerCase(),
            //   innerText: el.innerText || el.textContent,
            //   role: el.getAttribute("role"),
            //   href: el.getAttribute("href"),
            //   type: el.getAttribute("type"),
            // }));

            // console.log("Element details:", info);

            // Scroll into view and try real click
            onProgress({
              data: `70%`,
              status: "progress",
            });
            await element.evaluate((el) =>
              el.scrollIntoView({ behavior: "smooth", block: "center" })
            );

            await page2.screenshot({ path: "github-profile.png" });
            console.log("Contact button ss");
            try {
              try {
                await element.evaluate((el) => el.removeAttribute("target"));
              } catch (err) {
                console.log("Target not found in element : ", err);
              }
              await element.click();
              console.log("Clicked contact button");
            } catch (err) {
              console.log("Couldn't click : ", err);
              await page2.screenshot({ path: "github-profile.png" });
              console.log("SS");
              console.warn(
                "⚠️ Puppeteer click failed, using DOM click: ",
                err.message
              );
              // Try alternative click method
              await element.evaluate((el) => el.click());
              await page2.waitForNavigation();
            }
            await page2.waitForNavigation();

            onProgress({
              data: `78%`,
              status: "progress",
            });
            // Extract emails
            try {
              const emails = await page2.evaluate(() => {
                const bodyText = document.body.innerText;
                const emailRegex =
                  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
                return bodyText.match(emailRegex) || [];
              });

              if (emails.length > 0) {
                console.log("Emails : ", emails);

                onProgress({
                  data: `85%`,
                  status: "progress",
                });
                onProgress({ status: 200, data: emails });
              } else {
                onProgress({
                  data: `85%`,
                  status: "progress",
                });
                onProgress({ status: "contact link", data: page2.url() });
              }
            } catch (err) {
              console.error("Error extracting emails:", err.message);
              onProgress({ status: "contact link", data: page2.url() });
              return;
            }
          } catch (err) {
            console.error("Error finding contact section:", err.message);
            onProgress({
              status: "500",
              data: "Failed to locate contact section",
            });
            return;
          }
        } catch (err) {
          console.error("Error processing external links:", err.message);
          onProgress({
            status: "500",
            data: "Failed to process company website",
          });
          return;
        }
      } catch (err) {
        console.error("Unexpected error in scraper:", err.message);
        onProgress({
          status: "500",
          data: "An unexpected error occurred during scraping",
        });
        return;
      } finally {
        // Cleanup and close connections
        try {
          if (recorder) {
            await recorder.stop();
            console.log("✅ Recorder stopped");
            onProgress({ status: "200", data: "✅ Recorder stopped" });
          }
        } catch (err) {
          console.log("⚠️ Error stopping recorder:", err.message);
          onProgress({
            status: "500",
            data: "⚠️ Error stopping recorder: " + err.message,
          });
        }

        try {
          if (page2) {
            await page2.close();
            console.log("✅ Company website page closed");
            onProgress({
              status: "200",
              data: "✅ Company website page closed",
            });
          }
        } catch (err) {
          console.log("⚠️ Error closing company website page:", err.message);
          onProgress({
            status: "500",
            data: "⚠️ Error closing company website page: " + err.message,
          });
        }

        try {
          if (page) {
            await page.close();
            console.log("✅ LinkedIn page closed");
            onProgress({ status: "200", data: "✅ LinkedIn page closed" });
          }
        } catch (err) {
          console.log("⚠️ Error closing LinkedIn page:", err.message);
          onProgress({
            status: "500",
            data: "⚠️ Error closing LinkedIn page: " + err.message,
          });
        }

        try {
          if (browser) {
            await browser.close();
            console.log("✅ Browser closed successfully");
            onProgress({
              status: "220",
              data: "✅ Browser closed successfully",
            });
          }
        } catch (err) {
          console.log("⚠️ Error closing browser:", err.message);
          onProgress({
            status: "500",
            data: "⚠️ Error closing browser: " + err.message,
          });
        }
      }

      console.log("🎯 Scraping completed successfully!");
      onProgress({
        data: `93%`,
        status: "progress",
      });
      onProgress({ status: "200", data: "Scraping completed successfully" });
    };

    // Execute the scraper
    await cScraper();
  } catch (err) {
    console.error("Critical error in contactScraper:", err.message);
    if (onProgress) {
      onProgress({
        status: "500",
        data: "Critical error occurred during scraping",
      });
    }
  }

  // Return the function itself for chaining
  return contactScraper;
}

module.exports = { contactScraper };
