import express, { Router } from 'express';
import authController from '../controllers/auth_controller';

const authRouter: Router = express.Router();

authRouter.post('/', authController.login);

export default authRouter;