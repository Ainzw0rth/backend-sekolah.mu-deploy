import { Request, Response } from 'express';
import postgre from '../database';

interface KegiatanController {
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
}

const kegiatanController: KegiatanController = {
    getAll: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * from kegiatan");
            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({msg: error.msg})
        }
    },
    getById: async (req, res) => {
        try {
            const idGuru = req.query.id ? parseInt(req.query.id.toString()) : null;
            // TODO : filter by date
            // const tanggal = req.query.date ? req.query.date.toString() : null;

            if (!idGuru) {
                res.json({msg: "ID Guru is required"});
                return;
            } else if (isNaN(idGuru)) {
                res.json({msg: "ID must be a number"});
                return;
            }

            const query = `
                SELECT kegiatan.id_kegiatan, nama_kegiatan, nama_kelas, nama_program, nama_topik, tanggal, waktu
                FROM kegiatan 
                LEFT JOIN jadwal ON kegiatan.id_kegiatan = jadwal.id_kegiatan
                LEFT JOIN kelas ON jadwal.id_kelas = kelas.id_kelas
                LEFT JOIN topik ON topik.id_topik = kegiatan.id_topik
                LEFT JOIN program ON topik.id_program = program.id_program
                WHERE id_guru = $1`;

            const rows = await postgre.query(query, [idGuru]);
        
            res.json({msg: "OK", data: rows});
        
        } catch (error) {
            res.json({msg: error.message});
        }
    }
}
export default kegiatanController;