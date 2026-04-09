import express from 'express';
import PdfController from '../controllers/pdf';
import StatusController from '../controllers/status';

const router = express.Router();

router.get('/health', async (_req, res) => {
  const controller = new StatusController();
  const response = await controller.getMessage();
  return res.send(response);
});

router.post('/pdf/base64', async (req, res) => {
  try {
    const controller = new PdfController();
    const response = await controller.convertHtmlToPdfBase64(req.body);
    return res.send(response);
  } catch (err) {
    return res.status(500).json({
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
    res.status(500).json({ error: 'PDF generation failed', details: err instanceof Error ? err.message : err });
  }
});

export default router;
