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

function isVercel(): boolean {
  return !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
}

async function getExecutablePath(): Promise<string> {
  // In serverless (Vercel), use @sparticuz/chromium
  // The binary is extracted lazily — do NOT check existsSync on the returned path
  if (isVercel()) {
    return await chromium.executablePath();
  }

  // Local dev: find system Chrome
  for (const p of LOCAL_CHROME_PATHS) {
    if (existsSync(p)) return p;
  }

  // Fallback: try chromium.executablePath() anyway (e.g. Docker)
  try {
    return await chromium.executablePath();
  } catch {
    throw new Error(
      "No Chrome/Chromium binary found. Install Google Chrome or set CHROME_PATH."
    );
  }
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
    protocolTimeout: 90_000,
  });

  try {
    const page = await browser.newPage();
    // All assets are inline base64 — no network requests to wait for.
    // Use domcontentloaded and a generous timeout for cold-start serverless.
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      timeout: 90_000,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
