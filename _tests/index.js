const { expect } = require("chai");
const puppeteer = require("puppeteer");

describe("Test content", () => {
  let browser;
  let page;

  // This is ran when the suite starts up.
  beforeEach(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--lang=fr-FR,fr"]
    });
    page = await browser.newPage();
  });

  // This is ran after every test; clean up after your browser.
  afterEach(() => browser.close());

  it("should have a valide home page 🏠", async () => {

    await page.goto('https://boris.schapira.local', { waitUntil: "networkidle0" });
    const title = await page.$eval("h1", element => element.innerText);
    expect(title).to.equal('Boris Schapira');
  });
});
