import express, { Router } from "express";
import kelasController from "../controllers/kelas_controller";

const router : Router = express.Router();

router.get("/", kelasController.getAll);

export default router;