import express from "express";
import PdfController from "../controllers/pdf";
import StatusController from "../controllers/status";
import swaggerUi from "swagger-ui-express";

const router = express.Router();

router.get("/health", async (_req, res) => {
  const controller = new StatusController();
  const response = await controller.getMessage();
  return res.send(response);
});

router.post("/pdf/base64", async (_req, res) => {
	const controller = new PdfController();
	const response = await controller.convertHtmlToPdfBase64(_req.body);
	return res.send(response);
});

router.post("/pdf/file", async (_req , res) => {
    try {
        const controller = new PdfController();
        const buffer = await controller.convertHtmlToPdfFile(_req.body);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
        res.end(buffer);
    } catch(err) {
        res.status(500).json({ error: 'PDF generation failed', details: err instanceof Error ? err.message : err });
    }
});

export default router;