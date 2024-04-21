import { Request, Response } from 'express';
import postgre from '../database';

interface MuridController {
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    getByGuru: (req: Request, res: Response) => Promise<void>;
    getByGuruAndKegiatan: (req: Request, res: Response) => Promise<void>;
}

const muridController: MuridController = {
    getAll: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * from murid");
            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({msg: error.msg})
        }
    },
    getById: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * from murid WHERE id_murid = $1", [req.params.id]);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({ msg: error.msg });
        }
    },
    getByGuru: async (req, res) => {
        try {
            const { rows } = await postgre.query(`
                SELECT murid.id_murid, nama_murid, jenis_kelamin, tanggal_lahir, alamat, email, no_hp
                FROM murid 
                LEFT JOIN program
                ON murid.id_program = program.id_program
                LEFT JOIN topik
                ON program.id_program = topik.id_topik
                LEFT JOIN kegiatan
                ON kegiatan.id_topik = topik.id_topik
                WHERE kegiatan.id_guru = $1;`, [req.params.id]);

            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({msg: error.msg})
        }
    },  
    getByGuruAndKegiatan: async (req, res) => {
        try {
            const { rows } = await postgre.query(`
                SELECT murid.id_murid, nama_murid, jenis_kelamin, tanggal_lahir, alamat, email, no_hp
                FROM murid 
                LEFT JOIN program
                ON murid.id_program = program.id_program
                LEFT JOIN topik
                ON program.id_program = topik.id_topik
                LEFT JOIN kegiatan
                ON kegiatan.id_topik = topik.id_topik
                WHERE kegiatan.id_guru = $1 AND kegiatan.id_kegiatan = $2;`, [req.params.id, req.params.kegiatan_id]);

            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({msg: error.msg})
        }
    },  
}

export default muridController;