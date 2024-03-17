import express, { Router } from 'express';
import programController from '../controllers/program_controller';
const router: Router = express.Router();

router.get('/', programController.getAll);
router.get('/:id', programController.getById);

export default router;
