import express from "express";
import StatusController from "../controllers/status";

const router = express.Router();

router.get("/status", async (_req, res) => {
  const controller = new StatusController();
  const response = await controller.getMessage();
  return res.send(response);
});

export default router;