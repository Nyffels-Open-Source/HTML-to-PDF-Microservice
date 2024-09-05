import express from "express";
import PdfController from "../controllers/pdf";
import StatusController from "../controllers/status";
import swaggerUi from "swagger-ui-express";

const router = express.Router();

router.use("/swagger", swaggerUi.serve, swaggerUi.setup(undefined, {
  swaggerOptions: {
    url: "/swagger.json"
  }
}));

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