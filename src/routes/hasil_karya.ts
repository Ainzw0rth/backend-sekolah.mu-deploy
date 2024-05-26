import express, { Router } from 'express';
import hasilKaryaController from '../controllers/hasil_karya_controller';
const router: Router = express.Router();

router.get('/all', hasilKaryaController.getAll);
router.get('/', hasilKaryaController.getById);
router.post('/', hasilKaryaController.create);
router.patch('/', hasilKaryaController.update);
router.delete('/', hasilKaryaController.delete);

export default router;
