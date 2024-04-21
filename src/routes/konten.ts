import express, { Router } from 'express';
import kontenController from '../controllers/konten_controller';
const router: Router = express.Router();

router.get('/:kegiatanId', kontenController.getByKegiatan);

export default router;
