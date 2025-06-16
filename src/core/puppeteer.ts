import puppeteer, { Browser } from 'puppeteer';

let browserInstance: Browser | null = null;

/**
 * Returns a singleton Puppeteer browser instance.
 * Launches it only once and reuses it across requests.
 */
export async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox']
    });
  }
  return browserInstance;
}

/**
 * Gracefully closes the browser instance (if needed).
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}
