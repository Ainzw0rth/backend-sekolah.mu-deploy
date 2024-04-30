import express, { Router } from "express";
import muridController from "../controllers/murid_controller";

const router : Router = express.Router();

router.get("/", muridController.getAll);
router.get("/:id", muridController.getById);
router.get("/presensi/:id", muridController.getPresensi);
router.get("/nilai/:id", muridController.getAllPenilaian);
router.get("/avg-nilai/:id", muridController.getAvgPenilaian);
router.get("/catatan/:id", muridController.getCatatan);
router.get("/feedback/:id", muridController.getFeedback);
router.get("/karya/:id", muridController.getKarya);

export default router;