import express, { Router } from 'express';
import evaluasiController from '../controllers/evaluasi_controller';
const router: Router = express.Router();

router.get('/all', evaluasiController.getAllPendingByGuru);
router.get('/unpresenced', evaluasiController.getStudentUnpresenced);
router.get('/ungraded', evaluasiController.getStudentUngraded);
router.get('/uncommented', evaluasiController.getStudentUncommented);
router.get('/unfeedbacked', evaluasiController.getStudentUnfeedbacked);

export default router;