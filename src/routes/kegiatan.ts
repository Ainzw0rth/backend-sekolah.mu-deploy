import express, { Router } from 'express';
import kegiatanController from '../controllers/kegiatan_controller';
const router: Router = express.Router();

router.get('/', kegiatanController.getAll);
router.get('/instruksi', kegiatanController.getInstruksi);
router.get('/guru', kegiatanController.getByGuru);
router.get('/tanggal', kegiatanController.getByTanggal);
router.get('/percentage', kegiatanController.getPercentage);
router.get('/:id', kegiatanController.getById);
router.get('/murid/:id', kegiatanController.getMurid);

export default router;