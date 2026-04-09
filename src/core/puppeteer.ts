import puppeteer, { Browser } from 'puppeteer';

let browserInstance: Browser | null = null;
let browserLaunchPromise: Promise<Browser> | null = null;
const browserLaunchTimeout = Number(process.env.PUPPETEER_LAUNCH_TIMEOUT_MS) || 60000;

/**
 * Returns a singleton Puppeteer browser instance.
 * Launches it once and reuses it across requests.
 */
export async function getBrowser(): Promise<Browser> {
  if (browserInstance?.connected) {
    return browserInstance;
  }

  if (!browserLaunchPromise) {
    const executablePath = process.env.CHROME_BIN || process.env.PUPPETEER_EXECUTABLE_PATH;

    browserLaunchPromise = puppeteer.launch({
      headless: true,
      executablePath,
      timeout: browserLaunchTimeout,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    }).then((browser) => {
      browserInstance = browser;
      browser.on('disconnected', () => {
        browserInstance = null;
      });

      return browser;
    }).finally(() => {
      browserLaunchPromise = null;
    });
  }

  return browserLaunchPromise;
}

/**
 * Gracefully closes the browser instance.
 */
export async function closeBrowser(): Promise<void> {
  const browser = browserInstance;
  browserInstance = null;

  if (browser) {
    await browser.close();
  }
}
