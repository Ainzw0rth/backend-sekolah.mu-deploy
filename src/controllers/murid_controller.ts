import { Request, Response, raw } from 'express';
import postgre from '../database';

interface MuridController {
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    getPresensi: (req: Request, res: Response) => Promise<void>;
    getAllPenilaian: (req: Request, res: Response) => Promise<void>;
    getAvgPenilaian: (req: Request, res: Response) => Promise<void>;
    getCatatan: (req: Request, res: Response) => Promise<void>;
    getFeedback: (req: Request, res: Response) => Promise<void>;
    getKarya: (req: Request, res: Response) => Promise<void>;
}

const muridController: MuridController = {
    getAll: async (req, res) => {
        try {
            if(!req.query.kelas && !req.query.guru){
                // Get All Murid
                const { rows } = await postgre.query(`SELECT * FROM murid`);
                res.json({msg: "OK", data: rows})
            } else if (req.query.kelas && req.query.guru){
                // Get All Murid by Kelas and Guru
                const idKelas = req.query.kelas;
                const idGuru = req.query.guru;
                const rawSQL = `
                SELECT DISTINCT
                    murid.id_murid,
                    murid.nama_murid,
                    murid.jenis_kelamin,
                    murid.tanggal_lahir,
                    murid.nisn,
                    murid.path_foto_profil
                FROM murid 
                    LEFT JOIN murid_kelas 
                        ON murid_kelas.id_murid = murid.id_murid 
                    LEFT JOIN kelas
                        ON murid_kelas.id_kelas = kelas.id_kelas
                    LEFT JOIN jadwal
                        ON jadwal.id_kelas = kelas.id_kelas
                    LEFT JOIN kegiatan
                        ON kegiatan.id_kegiatan = jadwal.id_kegiatan
                    LEFT JOIN guru
                        ON kegiatan.id_guru = guru.id_guru
                WHERE kelas.id_kelas = $1 AND guru.id_guru = $2`;
                const { rows } = await postgre.query(rawSQL, [idKelas, idGuru]);
                res.json({msg: "OK", data: rows})
            } else if (req.query.kelas){
                // Get All Murid by Kelas
                const idKelas = req.query.kelas;
                const rawQuery = `
                SELECT DISTINCT
                    murid.id_murid,
                    murid.nama_murid,
                    murid.jenis_kelamin,
                    murid.tanggal_lahir,
                    murid.nisn,
                    murid.path_foto_profil
                FROM murid 
                    LEFT JOIN murid_kelas 
                        ON murid.id_murid = murid_kelas.id_murid
                WHERE murid_kelas.id_kelas = $1
                `;
                const { rows } = await postgre.query(rawQuery, [idKelas]);
                res.json({msg: "OK", data: rows})
            }

        } catch (error) {
            console.error('Error fetching All Murid:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },   
    getById: async (req, res) => {
        try {
            const idMurid = req.params.id;
            const { rows } = await postgre.query(`SELECT * FROM murid WHERE id_murid = $1`, [idMurid]);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            console.error('Error fetching murid by id:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    getPresensi: async (req, res) => {
        try {
            const idMurid = req.params.id;
            const rawQuery = `
            SELECT 
                catatan_kehadiran, 
                COUNT(*) AS jumlah_kehadiran
            FROM evaluasi
            WHERE 
                id_murid = $1 
                AND catatan_kehadiran IS NOT NULL
            GROUP BY catatan_kehadiran
            `;
            const { rows } = await postgre.query(rawQuery, [idMurid]);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            console.error('Error fetching presensi by id murid:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    getAllPenilaian: async (req, res) => {
        try {
            const idMurid = req.params.id;
            const rawQuery = `
            SELECT 
                jadwal.id_kegiatan, 
                evaluasi.penilaian
            FROM evaluasi
                LEFT JOIN jadwal
                    ON evaluasi.id_jadwal = jadwal.id_jadwal
            WHERE 
                id_murid = $1 
                AND penilaian IS NOT NULL
            `;
            const { rows } = await postgre.query(rawQuery, [idMurid]);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            console.error('Error fetching all penilaian by id murid:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    getAvgPenilaian: async (req, res) => {
        try {
            const idMurid = req.params.id;
            const rawQuery = `
            SELECT 
                ROUND(AVG(penilaian), 2) AS avg_penilaian
            FROM evaluasi
            WHERE id_murid = $1
            GROUP BY id_murid
            `;
            const { rows } = await postgre.query(rawQuery, [idMurid]);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            console.error('Error fetching avg penilaian by id murid:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    getCatatan: async (req, res) => {
        try {
            const idMurid = req.params.id;
            const rawQuery = `
            SELECT 
                jadwal.id_kegiatan,
                kegiatan.nama_kegiatan,
                evaluasi.catatan
            FROM evaluasi
                LEFT JOIN jadwal
                    ON evaluasi.id_jadwal = jadwal.id_jadwal
                LEFT JOIN kegiatan
                    ON jadwal.id_kegiatan = kegiatan.id_kegiatan
            WHERE 
                evaluasi.id_murid = $1 
                AND evaluasi.catatan IS NOT NULL
            `;
            const { rows } = await postgre.query(rawQuery, [idMurid]);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            console.error('Error fetching catatan by id murid:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    getFeedback: async (req, res) => {
        try {
            const idMurid = req.params.id;
            const rawQuery = `
            SELECT 
                jadwal.id_kegiatan,
                kegiatan.nama_kegiatan,
                evaluasi.feedback
            FROM evaluasi
                LEFT JOIN jadwal
                    ON evaluasi.id_jadwal = jadwal.id_jadwal
                LEFT JOIN kegiatan
                    ON jadwal.id_kegiatan = kegiatan.id_kegiatan
            WHERE 
                evaluasi.id_murid = $1 
                AND evaluasi.feedback IS NOT NULL
            `;
            const { rows } = await postgre.query(rawQuery, [idMurid]);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            console.error('Error fetching feedback by id murid:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    getKarya: async (req, res) => {
        try {
            const idMurid = req.params.id;
            const rawQuery = `
            SELECT 
                jadwal.id_kegiatan,
                kegiatan.nama_kegiatan,
                evaluasi.id_karya,
                karya.nama_karya,
                karya.tipe_file,
                karya.file_path
            FROM evaluasi
                LEFT JOIN jadwal
                    ON evaluasi.id_jadwal = jadwal.id_jadwal
                LEFT JOIN kegiatan
                    ON jadwal.id_kegiatan = kegiatan.id_kegiatan
                LEFT JOIN karya
                    ON evaluasi.id_karya = karya.id_karya
            WHERE 
                evaluasi.id_murid = $1
                AND evaluasi.id_karya IS NOT NULL
            `;
            const { rows } = await postgre.query(rawQuery, [idMurid]);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            console.error('Error fetching karya by id murid:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
}

export default muridController;