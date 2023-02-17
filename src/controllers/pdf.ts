import puppeteer from 'puppeteer';
import { Body, Post, Route, Security } from 'tsoa';

interface PdfResponse {
  base64: string;
}

interface PdfRequest {
	html: string
}


@Route('html')
export default class PdfController {
	@Security("authorization")
  @Post('/')
  public async convertHtmlToPdf(
		@Body() request: PdfRequest
	): Promise<PdfResponse> {
    const renderURL = `http://localhost:${process.env.PORT || 8000}/pdf/render?url=${request}`;
    console.log(renderURL);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(renderURL);
    const pdf = await page.pdf();
    await browser.close();

    return {
      base64: pdf.toString('base64'),
    };
  }
}
