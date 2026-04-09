import { Body, Post, Produces, Route } from 'tsoa';
import { convertHtmlToPdfBuffer } from '../core/pdf';

interface PdfResponse {
  base64: string;
}

export interface PdfOptions {
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
   * Hides default white background and allows generating pdfs with transparency.
   * @defaultValue false
   */
  omitBackground?: boolean;
  /**
   * Timeout in milliseconds. Pass `0` to disable timeout.
   * @defaultValue 30000
   */
  timeout?: number;
}

export interface PdfRequest {
  html: string;
  options?: PdfOptions;
}

function sanitizePdfRequest(request: PdfRequest): PdfRequest {
  if (!request || typeof request !== 'object' || typeof request.html !== 'string' || !request.html.trim()) {
    throw new Error('Request body must contain a non-empty html string');
  }

  if (request.options !== undefined && (typeof request.options !== 'object' || Array.isArray(request.options))) {
    throw new Error('options must be an object when provided');
  }

  if (request.options?.scale !== undefined && (request.options.scale < 0.1 || request.options.scale > 2)) {
    throw new Error('scale must be between 0.1 and 2');
  }

  return {
    html: request.html,
    options: request.options ? { ...request.options } : undefined,
  };
}

@Route('pdf')
export default class PdfController {
  @Post('/base64')
  public async convertHtmlToPdfBase64(@Body() request: PdfRequest): Promise<PdfResponse> {
    try {
      const buffer = await convertHtmlToPdfBuffer(sanitizePdfRequest(request));
      return {
        base64: buffer.toString('base64'),
      };
    } catch (e) {
      console.error('PDF rendering failed:', e);
      throw new Error('PDF generation failed');
    }
  }

  @Produces('application/pdf')
  @Post('/file')
  public async convertHtmlToPdfFile(@Body() request: PdfRequest): Promise<Buffer> {
    try {
      return await convertHtmlToPdfBuffer(sanitizePdfRequest(request));
    } catch (e) {
      console.error('PDF rendering failed:', e);
      throw new Error('PDF generation failed');
    }
  }
}
