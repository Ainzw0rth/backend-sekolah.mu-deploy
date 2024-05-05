import express, { Router } from 'express';
import evaluasiController from '../controllers/evaluasi_controller';
const router: Router = express.Router();

router.get('/:guruId', evaluasiController.getAllPendingByGuru);

export default router;