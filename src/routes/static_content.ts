import express, { Router } from 'express';
import staticContentController from '../controllers/static_content_controller';
const staticContentRouter: Router = express.Router();

staticContentRouter.get('/pdf/:filepath(*)', staticContentController.getPdf);
staticContentRouter.get('/image/:filepath(*)', staticContentController.getImage);

export default staticContentRouter;
