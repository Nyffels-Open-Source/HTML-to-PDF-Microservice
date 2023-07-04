import puppeteer from 'puppeteer';
import { Body, Post, Route, Security } from 'tsoa';

interface PdfResponse {
  base64: string;
}

interface PdfRequest {
  html: string;
  options?: {
    /**
     * Scales the rendering of the web page. Amount must be between `0.1` and `2`.
     * @defaultValue 1
     */
    scale?: number;
    /**
     * Whether to show the header and footer.
     * @defaultValue false
     */
    displayHeaderFooter?: boolean;
    /**
     * HTML template for the print header. Should be valid HTML with the following
     * classes used to inject values into them:
     *
     * - `date` formatted print date
     *
     * - `title` document title
     *
     * - `url` document location
     *
     * - `pageNumber` current page number
     *
     * - `totalPages` total pages in the document
     */
    headerTemplate?: string;
    /**
     * HTML template for the print footer. Has the same constraints and support
     * for special classes as {@link PDFOptions.headerTemplate}.
     */
    footerTemplate?: string;
    /**
     * Set to `true` to print background graphics.
     * @defaultValue false
     */
    printBackground?: boolean;
    /**
     * Whether to print in landscape orientation.
     * @defaultValue = false
     */
    landscape?: boolean;
    /**
     * Paper ranges to print, e.g. `1-5, 8, 11-13`.
     * @defaultValue The empty string, which means all pages are printed.
     */
    pageRanges?: string;
    /**
     * @remarks
     * If set, this takes priority over the `width` and `height` options.
     * @defaultValue `letter`.
     */
    format?: 'letter' | 'legal' | 'tabloid' | 'ledger' | 'a0' | 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6';
    /**
     * Sets the width of paper. You can pass in a number or a string with a unit.
     */
    width?: string | number;
    /**
     * Sets the height of paper. You can pass in a number or a string with a unit.
     */
    height?: string | number;
    /**
     * Give any CSS `@page` size declared in the page priority over what is
     * declared in the `width` or `height` or `format` option.
     * @defaultValue `false`, which will scale the content to fit the paper size.
     */
    preferCSSPageSize?: boolean;
    /**
     * Set the PDF margins.
     * @defaultValue no margins are set.
     */
    margin?: {
      top?: string | number;
      bottom?: string | number;
      left?: string | number;
      right?: string | number;
    };
    /**
     * The path to save the file to.
     *
     * @remarks
     *
     * If the path is relative, it's resolved relative to the current working directory.
     *
     * @defaultValue the empty string, which means the PDF will not be written to disk.
     */
    path?: string;
    /**
     * Hides default white background and allows generating pdfs with transparency.
     * @defaultValue false
     */
    omitBackground?: boolean;
    /**
     * Timeout in milliseconds. Pass `0` to disable timeout.
     * @defaultValue 30000
     */
    timeout?: number;
  };
}

@Route('html')
export default class PdfController {
  @Security('authorization')
  @Post('/')
  public async convertHtmlToPdf(@Body() request: PdfRequest): Promise<PdfResponse> {
    const browser = await puppeteer.launch({
			executablePath: '/usr/bin/google-chrome',
			args: ['--no-sandbox']
		});
    const page = await browser.newPage();

		await page.setContent(request.html);
    // await page.goto(`data:text/html,${request.html}`, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf(request.options);
    await browser.close();

    return {
      base64: pdfBuffer.toString('base64'),
    };
  }
}
