import express, { Router } from 'express';
import programController from '../controllers/program_controller';
const programRouter: Router = express.Router();

programRouter.get('/', programController.getAll);
programRouter.get('/guru/:id', programController.getByGuru);
programRouter.get('/:id', programController.getById);
programRouter.get('/kompetensi/:id', programController.getCompetencies);
programRouter.get('/kegiatan/:id', programController.getActivities);

export default programRouter;
