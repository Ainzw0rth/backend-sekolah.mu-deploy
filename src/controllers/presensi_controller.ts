import { Request, Response } from 'express';
import postgre from '../database';

interface PresensiController {
    getForKegiatan: (req: Request, res: Response) => Promise<void>;
    updatePresensiKegiatan: (req: Request, res: Response) => Promise<void>;
}

const presensiController: PresensiController = {
    getForKegiatan: async (req, res) => {
        try {
            const { rows } = await postgre.query(`
                SELECT m.id_murid, m.nama_murid, m.path_foto_profil, e.catatan_kehadiran
                FROM evaluasi e
                JOIN murid m ON e.id_murid = m.id_murid
                WHERE e.id_kegiatan = $1;
            `, [req.params.id]);
            
            if (rows.length === 0) {
                res.status(404).json({ msg: 'Data tidak ditemukan' });
                return;
            }

            res.status(200).json({ data: rows });
            return;
        } catch (error) {
            res.status(500).json({ msg: error.msg });
            return;
        }
    },
    updatePresensiKegiatan: async (req, res) => {
        const students = req.body;
        for (const student of students) {
            if (!student.id_murid || !student.catatan_kehadiran) {  
                res.status(400).json({ msg: 'Invalid request' });
                return;
            }
        }

        for (const student of students) {
            try {
                await postgre.query(`
                    UPDATE evaluasi
                    SET catatan_kehadiran = $3
                    WHERE id_kegiatan = $1 AND id_murid = $2;
                `, [req.params.id, student.id_murid, student.catatan_kehadiran]);
                
            } catch (error) {
                res.status(500).json({ msg: error.msg });
                return;
            }
        }

        res.status(200).json({ msg: 'Data berhasil diubah' });
    }
}

export default presensiController;