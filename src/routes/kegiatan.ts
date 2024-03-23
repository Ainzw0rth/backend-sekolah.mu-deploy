import express, { Router } from 'express';
import kegiatanController from '../controllers/kegiatan_controller';
const router: Router = express.Router();

router.get('/', kegiatanController.getAll);
router.get('/instruksi-guru/:id', kegiatanController.getInstruksiGuru);
router.get('/instruksi', kegiatanController.getInstruksi);
router.get('/:id', kegiatanController.getById);

export default router;