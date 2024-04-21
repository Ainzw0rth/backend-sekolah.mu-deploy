import express, { Router } from 'express';
import evaluasiController from '../controllers/evaluasi_controller';
const router: Router = express.Router();

router.get('/all', evaluasiController.getAll);
router.get('/', evaluasiController.getById);
router.post('/', evaluasiController.create);
router.patch('/', evaluasiController.update);

export default router;