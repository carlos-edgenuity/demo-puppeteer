import puppeteer from "puppeteer";
import chai from "chai";

const config = {
  stayOpen: false,
  headless: false,
  credentials: {
    Site: `https://app.qa.edgenuityapp.com/`,
    Username: `UPDATE_ME`,
    Password: `UPDATE_ME`,
    "Login Code": `UPDATE_ME`,
  },
  selectors: {
    username: `input[id=username]`,
    password: `input[type=password]`,
    loginCode: `input[autocomplete="logincode"]`,
    title: `label[class="menuTitle"]`,
  },
  assertions: {
    title: "Classes",
  },
};

async function main() {
  const browser = await puppeteer.launch(config);
  const page = await browser.newPage();

  // Navigate to the login page but wait for the page to load and reload like crazy
  await Promise.all([
    page.waitForNavigation(),
    page.goto(config.credentials.Site),
  ]);

  try {
    console.log("First attempt");
    await fillInForm(page);
  } catch (error) {
    await sleep(2_000);
    console.log("Second attempt");
    await fillInForm(page);
  }

  // Submit the form
  await page.click("button[type=submit]");

  // Wait for the logged-in page to load
  await page.waitForNavigation();
  await page.waitForSelector(config.selectors.title);
  await sleep(500);

  const elementText = await page.evaluate((s) => {
    console.log("s", s);
    var r = document.querySelector(s)?.textContent;
    console.log("r", r);
    return r;
  }, config.selectors.title);

  chai.expect(elementText).to.equal(config.assertions.title);

  if (config.stayOpen) {
  } else {
    await browser.close();
  }
}

function clearField(f) {
  let element = document.querySelector(f);
  element && (element.value = "");
}

async function fillInForm(page) {
  // Fill in the username field
  await page.evaluate(clearField, config.selectors.username);
  await page.focus(config.selectors.username);
  await page.keyboard.type(config.credentials.Username);

  // Fill in the password field
  await page.evaluate(clearField, config.selectors.password);
  await page.focus(config.selectors.password);
  await page.keyboard.type(config.credentials.Password);

  // Fill in the login code field
  await page.evaluate(clearField, config.selectors.loginCode);
  await page.focus(config.selectors.loginCode);
  await page.keyboard.type(config.credentials["Login Code"]);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

try {
  await main();
  await main();
  await main();
  await main();
  await main();
} catch (error) {
  console.error(error);
}
