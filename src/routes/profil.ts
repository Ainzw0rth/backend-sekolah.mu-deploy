import express, { Router } from 'express';
import kegiatanController from '../controllers/profil_controller';
const router: Router = express.Router();

router.get('/', kegiatanController.getAll);
router.get('/:id', kegiatanController.getById);
router.get('/badges/:id', kegiatanController.getAllBadges);
router.post('/badges', kegiatanController.addBadge);
router.get('/badges/streak/:id', kegiatanController.checkBadgeStreak);
router.get('/badges/streakmaster/:id', kegiatanController.checkBadgeStreakMaster);
router.get('/badges/streakking/:id', kegiatanController.checkBadgeStreakKing);
router.get('/badges/gocap/:id', kegiatanController.checkBadgeGocap);
router.get('/badges/cepek/:id', kegiatanController.checkBadgeCepek);
router.get('/badges/konsisten/:id', kegiatanController.checkBadgeKonsisten);
router.get('/badges/ambis/:id', kegiatanController.checkBadgeAmbis);

export default router;