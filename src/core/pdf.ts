import { closeBrowser, getBrowser } from './puppeteer';
import { PdfRequest } from '../controllers/pdf';
import { withRenderSlot } from './renderQueue';

function isMainFrameNotReadyError(error: unknown): boolean {
  return error instanceof Error && error.message.includes('Requesting main frame too early');
}

export async function convertHtmlToPdfBuffer(request: PdfRequest) {
  return withRenderSlot(async () => {
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const browser = await getBrowser();
      const page = await browser.newPage();

      try {
        // Explicitly navigate to a blank document before injecting content so the
        // page always has a settled main frame.
        await page.goto('about:blank');
        await page.setContent(request.html, {
          waitUntil: 'networkidle0',
          timeout: request.options?.timeout ?? 30000,
        });

        return await page.pdf(request.options ?? {});
      } catch (error) {
        if (attempt < maxAttempts && isMainFrameNotReadyError(error)) {
          await closeBrowser();
          continue;
        }

        throw error;
      } finally {
        if (!page.isClosed()) {
          await page.close().catch(() => undefined);
        }
      }
    }

    throw new Error('PDF generation failed after retrying page initialization');
  });
}
