import express, { Router } from 'express';
import jadwalController from '../controllers/jadwal_controller';
const router: Router = express.Router();

router.get('/', jadwalController.getAll);

export default router;