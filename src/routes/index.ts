import express from "express";
import PdfController from "../controllers/pdf";
import StatusController from "../controllers/status";

const router = express.Router();

router.get("/status", async (_req, res) => {
  const controller = new StatusController();
  const response = await controller.getMessage();
  return res.send(response);
});

router.post("/html", async (_req, res) => {
	const controller = new PdfController();
	const response = await controller.convertHtmlToPdf(_req.body);
	return res.send(response);
});

// router.post('async/html', async (_req, res) => {
//   // const controller = new PdfController();
//   return res.send("OK");
// })

export default router;