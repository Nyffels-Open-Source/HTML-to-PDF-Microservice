import { getBrowser } from './puppeteer';
import { PdfRequest } from '../controllers/pdf';
import { withRenderSlot } from './renderQueue';

export async function convertHtmlToPdfBuffer(request: PdfRequest) {
  return withRenderSlot(async () => {
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
      await page.setContent(request.html, {
        waitUntil: 'networkidle0',
        timeout: request.options?.timeout ?? 30000,
      });

      return await page.pdf(request.options ?? {});
    } finally {
      await page.close();
    }
  });
}
