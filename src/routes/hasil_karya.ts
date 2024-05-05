import express, { Router } from 'express';
import evaluasiController from '../controllers/hasil_karya_controller';
const router: Router = express.Router();

router.get('/all', evaluasiController.getAll);
router.get('/', evaluasiController.getById);
router.post('/', evaluasiController.create);
router.patch('/', evaluasiController.update);

export default router;
