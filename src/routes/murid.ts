import express, { Router } from 'express';
import kontenController from '../controllers/murid_controller';
const router: Router = express.Router();

router.get('/', kontenController.getAll);
router.get('/:id', kontenController.getById);
router.get('/guru/:id', kontenController.getByGuru);
router.get('/guru/:id/kegiatan/:kegiatan_id', kontenController.getByGuruAndKegiatan);

export default router;
