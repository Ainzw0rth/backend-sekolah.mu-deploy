import { Request, Response } from 'express';
import postgre from '../database';

interface KelasController {
    getAll: (req: Request, res: Response) => Promise<void>;
}

const kelasController: KelasController = {
    getAll: async (req, res) => {
        try {
            if (!req.query.guru) {
                const { rows } = await postgre.query(`SELECT * FROM kelas`);
                res.json({msg: "OK", data: rows})
            } else {
                // Get All Kelas by Guru
                const idGuru = req.query.guru;
                const rawQuery = `
                SELECT DISTINCT kelas.id_kelas, kelas.nama_kelas, kelas.jenjang 
                FROM kelas 
                    LEFT JOIN jadwal 
                        ON kelas.id_kelas = jadwal.id_kelas
                    LEFT JOIN kegiatan
                        ON jadwal.id_kegiatan = kegiatan.id_kegiatan
                    LEFT JOIN guru
                        ON kegiatan.id_guru = guru.id_guru 
                WHERE guru.id_guru = $1
                `
                console.log(idGuru);
                const { rows } = await postgre.query(rawQuery, [idGuru]);
                res.json({msg: "OK", data: rows})
            }
        } catch (error) {
            console.error('Error fetching kelas:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
}

export default kelasController;