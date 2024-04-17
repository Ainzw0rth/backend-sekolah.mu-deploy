import express, { Router } from 'express';
import kegiatanController from '../controllers/kegiatan_controller';
const router: Router = express.Router();

router.get('/', kegiatanController.getAll);
router.get('/instruksi/:id', kegiatanController.getInstruksi);
router.get('/guru/:id', kegiatanController.getByGuru);
router.get('/:id', kegiatanController.getById);


export default router;