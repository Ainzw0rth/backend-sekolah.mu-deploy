import express, { Router } from 'express';
import kegiatanController from '../controllers/kegiatan_controller';
const router: Router = express.Router();

router.get('/', kegiatanController.getAll);
router.get('/instruksi', kegiatanController.getInstruksi);
router.get('/guru', kegiatanController.getByGuru);
router.get('/:id', kegiatanController.getById);
router.get('/tanggal/:id', kegiatanController.getByTanggal);


export default router;