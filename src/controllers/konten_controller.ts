import { Request, Response } from 'express';
import postgre from '../database';

interface KontenController {
    getByKegiatan: (req: Request, res: Response) => Promise<void>;
}

const kontenController: KontenController = {
    getByKegiatan: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT nama_konten, tipe_file, file_path from konten WHERE id_kegiatan = $1", [req.params.kegiatanId]);
            if (rows.length === 0) {
                res.status(404).json({msg: "Data tidak ditemukan"})
                return
            }
            res.status(200).json({msg: "OK", data: rows})
        }
        catch (error) {
            res.status(500).json({msg: error.message})
        }
    },
} 

export default kontenController;