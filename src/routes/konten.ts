import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

router.get('/', (req: Request, res: Response, next) => {
  res.json({
    data: [
      {
        nama_konten: 'Mengenal jerapah',
        tipe_konten: 'Pelajaran',
        nama_file: 'jerapah.pdf',
        tipe_file: 'pdf',
        file_path: 'downloads/jerapah.pdf',
        id_kegiatan: '1'
      }
    ],
    meta: {
      page: 1
    }
  });
});

export default router;
