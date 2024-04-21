import express, { Router } from "express";
import presensiController from "../controllers/presensi_controller";

const router : Router = express.Router();

router.get("/:id", presensiController.getForKegiatan);
router.patch("/:id", presensiController.updatePresensiKegiatan);

export default router;