import express from 'express';
import PdfController from '../controllers/pdf';
import StatusController from '../controllers/status';
import { HttpError } from '../core/errors';
import { getRenderQueueMetrics } from '../core/renderQueue';

const router = express.Router();

router.get('/health', async (_req, res) => {
  const controller = new StatusController();
  const response = await controller.getMessage();
  return res.send(response);
});

router.get('/metrics', (_req, res) => {
  return res.json({
    status: 'ok',
    renderQueue: getRenderQueueMetrics(),
  });
});

router.post('/pdf/base64', async (req, res) => {
  try {
    const controller = new PdfController();
    const response = await controller.convertHtmlToPdfBase64(req.body);
    return res.send(response);
  } catch (err) {
    const statusCode = err instanceof HttpError ? err.statusCode : 500;
    return res.status(statusCode).json({
      error: 'PDF generation failed',
      details: err instanceof Error ? err.message : err,
    });
  }
});

router.post('/pdf/file', async (req, res) => {
  try {
    const controller = new PdfController();
    const buffer = await controller.convertHtmlToPdfFile(req.body);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
    res.end(buffer);
  } catch (err) {
    const statusCode = err instanceof HttpError ? err.statusCode : 500;
    res.status(statusCode).json({ error: 'PDF generation failed', details: err instanceof Error ? err.message : err });
  }
});

export default router;
