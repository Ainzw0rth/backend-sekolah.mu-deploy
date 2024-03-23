import express, { Router } from 'express';
import kegiatanController from '../controllers/kegiatan_controller';
const router: Router = express.Router();

router.get('/', kegiatanController.getAll);
router.get('/:id', kegiatanController.getById);
router.get('/instruksi-guru/:id', kegiatanController.getInstruksiGuru);
router.get('/instruksi-murid/:id', kegiatanController.getInstruksiMurid);

export default router;
