import express, { Router } from 'express';
import topikController from '../controllers/topik_controller';
const router: Router = express.Router();

router.get('/', topikController.getAll);
router.get('/:id', topikController.getById);

export default router;
