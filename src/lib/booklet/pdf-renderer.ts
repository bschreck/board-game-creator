import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

/**
 * Renders an HTML string to a PDF buffer using Puppeteer + @sparticuz/chromium.
 * Works both locally (uses system Chrome) and on Vercel serverless.
 */
export async function renderPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1280, height: 900 },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
