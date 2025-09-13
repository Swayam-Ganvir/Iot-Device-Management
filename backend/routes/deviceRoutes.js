import express from "express";
import { getDeviceData, getDevices, createTelemetry } from "../controllers/deviceController.js";
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.get("/devices",protect, getDevices);
router.get("/devices/:id/data",protect, getDeviceData);
router.post("/telemetry",protect, createTelemetry);

export default router;