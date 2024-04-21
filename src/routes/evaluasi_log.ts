import express, { Router } from 'express';
import evaluasiLogController from '../controllers/evaluasi_log_controller';
const router: Router = express.Router();

router.get('/', evaluasiLogController.getAll);
router.post('/', evaluasiLogController.create);

export default router;