import express, { Router } from 'express';
import kegiatanController from '../controllers/kegiatan_controller';
const router: Router = express.Router();

router.get('/', kegiatanController.getAll);
router.get('/:id', kegiatanController.getById);
router.get('/instruksi', kegiatanController.getInstruksi);

export default router;