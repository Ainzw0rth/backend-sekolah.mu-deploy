import express, { Router } from 'express';
import kontenController from '../controllers/konten_controller';
const router: Router = express.Router();

router.get('/', kontenController.getAll);
router.get('/:id', kontenController.getById);

export default router;
