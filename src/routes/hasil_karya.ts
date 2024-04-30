import express from 'express';
import multer from 'multer';
import hasilKaryaController from '../controllers/hasil_karya_controller';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Define multer middleware to handle file upload

router.get('/:kegiatan_id/:murid_id', hasilKaryaController.getById);
router.post('/upload', upload.single('file'), hasilKaryaController.uploadFile); // Handle file upload

export default router;
