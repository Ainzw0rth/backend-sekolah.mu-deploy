import express, { Router } from 'express';
import evaluasiController from '../controllers/evaluasi_controller';
const router: Router = express.Router();

router.get('/', evaluasiController.getAllPendingByGuru);

export default router;