import {closeBrowser, getBrowser} from "./puppeteer";
import {PdfRequest} from "../controllers/pdf";

export async function convertHtmlToPdfBuffer(request: PdfRequest) {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setContent(request.html);
    const pdfBuffer = await page.pdf(request.options ?? {});

    await closeBrowser();

    return pdfBuffer;
}