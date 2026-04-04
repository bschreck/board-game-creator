import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { existsSync } from "fs";

const LOCAL_CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

async function getExecutablePath(): Promise<string> {
  // In serverless (Vercel), use @sparticuz/chromium
  try {
    const serverlessPath = await chromium.executablePath();
    if (serverlessPath && existsSync(serverlessPath)) {
      return serverlessPath;
    }
  } catch {
    // Not in serverless environment, fall through to local detection
  }

  // Local dev: find system Chrome
  for (const p of LOCAL_CHROME_PATHS) {
    if (existsSync(p)) return p;
  }

  throw new Error(
    "No Chrome/Chromium binary found. Install Google Chrome or set CHROME_PATH."
  );
}

/**
 * Renders an HTML string to a PDF buffer using Puppeteer + @sparticuz/chromium.
 * Works both locally (uses system Chrome) and on Vercel serverless.
 */
export async function renderPdf(html: string): Promise<Buffer> {
  const executablePath = await getExecutablePath();
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1280, height: 900 },
    executablePath,
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
