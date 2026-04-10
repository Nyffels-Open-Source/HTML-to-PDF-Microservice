import { Body, Post, Produces, Route } from 'tsoa';
import { convertHtmlToPdfBuffer } from '../core/pdf';
import { HttpError } from '../core/errors';

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

function assertBoolean(value: unknown, field: string): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'boolean') {
    throw new HttpError(400, `${field} must be a boolean`);
  }

  return value;
}

function assertNumber(value: unknown, field: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new HttpError(400, `${field} must be a number`);
  }

  return value;
}

function assertString(value: unknown, field: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new HttpError(400, `${field} must be a string`);
  }

  return value;
}

function assertPrintDimension(value: unknown, field: string): string | number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new HttpError(400, `${field} must be a string or number`);
  }

  if (typeof value === 'number' && Number.isNaN(value)) {
    throw new HttpError(400, `${field} must not be NaN`);
  }

  return value;
}

function sanitizePdfRequest(request: PdfRequest): PdfRequest {
  if (!request || typeof request !== 'object' || typeof request.html !== 'string' || !request.html.trim()) {
    throw new HttpError(400, 'Request body must contain a non-empty html string');
  }

  if (request.options !== undefined && (typeof request.options !== 'object' || Array.isArray(request.options))) {
    throw new HttpError(400, 'options must be an object when provided');
  }

  const options = request.options;
  if (!options) {
    return { html: request.html };
  }

  const scale = assertNumber(options.scale, 'options.scale');
  if (scale !== undefined && (scale < 0.1 || scale > 2)) {
    throw new HttpError(400, 'options.scale must be between 0.1 and 2');
  }

  const format = assertString(options.format, 'options.format') as PdfOptions['format'];
  const allowedFormats = new Set<PdfOptions['format']>(['letter', 'legal', 'tabloid', 'ledger', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6']);
  if (format !== undefined && !allowedFormats.has(format)) {
    throw new HttpError(400, `options.format must be one of: ${Array.from(allowedFormats).join(', ')}`);
  }

  let margin: PdfOptions['margin'];
  if (options.margin !== undefined) {
    if (typeof options.margin !== 'object' || options.margin === null || Array.isArray(options.margin)) {
      throw new HttpError(400, 'options.margin must be an object');
    }

    margin = {
      top: assertPrintDimension(options.margin.top, 'options.margin.top'),
      bottom: assertPrintDimension(options.margin.bottom, 'options.margin.bottom'),
      left: assertPrintDimension(options.margin.left, 'options.margin.left'),
      right: assertPrintDimension(options.margin.right, 'options.margin.right'),
    };
  }

  return {
    html: request.html,
    options: {
      scale,
      displayHeaderFooter: assertBoolean(options.displayHeaderFooter, 'options.displayHeaderFooter'),
      headerTemplate: assertString(options.headerTemplate, 'options.headerTemplate'),
      footerTemplate: assertString(options.footerTemplate, 'options.footerTemplate'),
      printBackground: assertBoolean(options.printBackground, 'options.printBackground'),
      landscape: assertBoolean(options.landscape, 'options.landscape'),
      pageRanges: assertString(options.pageRanges, 'options.pageRanges'),
      format,
      width: assertPrintDimension(options.width, 'options.width'),
      height: assertPrintDimension(options.height, 'options.height'),
      preferCSSPageSize: assertBoolean(options.preferCSSPageSize, 'options.preferCSSPageSize'),
      margin,
      omitBackground: assertBoolean(options.omitBackground, 'options.omitBackground'),
      timeout: assertNumber(options.timeout, 'options.timeout'),
    },
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
      if (e instanceof HttpError) {
        throw e;
      }

      throw new HttpError(500, 'PDF generation failed');
    }
  }

  @Produces('application/pdf')
  @Post('/file')
  public async convertHtmlToPdfFile(@Body() request: PdfRequest): Promise<Buffer> {
    try {
      return await convertHtmlToPdfBuffer(sanitizePdfRequest(request));
    } catch (e) {
      console.error('PDF rendering failed:', e);
      if (e instanceof HttpError) {
        throw e;
      }

      throw new HttpError(500, 'PDF generation failed');
    }
  }
}
