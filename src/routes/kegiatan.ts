import express, { Router } from 'express';
import kegiatanController from '../controllers/kegiatan_controller';
const router: Router = express.Router();

router.get('/', kegiatanController.getByGuru);
router.get('/instruksi', kegiatanController.getInstruksi);
router.get('/guru', kegiatanController.getByGuru);
router.get('/:id', kegiatanController.getById);


export default router;