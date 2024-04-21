import express, { Router } from 'express';
import hasilKaryaController from '../controllers/hasil_karya_controller';
const router: Router = express.Router();

router.get('/:kegiatan_id/murid_id', hasilKaryaController.getById);


export default router;