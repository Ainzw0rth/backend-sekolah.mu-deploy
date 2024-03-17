import express, { Request, Response, Router } from 'express';
const kontenController = require('../controllers/konten_controller');
const router: Router = express.Router();

router.get('/', kontenController.getAll);

export default router;
