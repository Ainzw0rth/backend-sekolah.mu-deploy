import { Request, Response } from 'express';
import postgre from '../database';

interface ProgramController {
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    getByGuru: (req: Request, res: Response) => Promise<void>;
    getCompetencies: (req: Request, res: Response) => Promise<void>;
    getActivities: (req: Request, res: Response) => Promise<void>;
}

const programController: ProgramController = {
    getAll: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * from program");
            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({msg: error.msg})
        }
    },
    getById: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * from program WHERE id_program = $1", [req.params.id]);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({ msg: error.msg });
        }
    },
    getByGuru: async (req, res) => {
        try {
            const { rows } = await postgre.query(`
                SELECT 
                    program.id_program, 
                    nama_program, 
                    program.path_banner,
                    kegiatan.id_kegiatan,
                    kegiatan.nama_kegiatan,
                    periode_belajar, 
                    tahun_akademik,
                    kegiatan.id_guru
                FROM program 
                    INNER JOIN topik
                        ON program.id_program = topik.id_program
                    INNER JOIN kegiatan
                        ON kegiatan.id_topik = topik.id_topik
                WHERE kegiatan.id_guru = $1;`, [req.params.id]);

            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({msg: error.msg})
        }
    },    
    getCompetencies: async (req, res) => {
        try {
            const { rows } = await postgre.query(`
                SELECT kompetensi.judul_kompetensi
                FROM program 
                    INNER JOIN program_kompetensi ON program.id_program = program_kompetensi.id_program
                    INNER JOIN kompetensi ON program_kompetensi.id_kompetensi = kompetensi.id_kompetensi
                WHERE program.id_program = $1;`, [req.params.id]);

            if (rows.length === 0) {
                res.status(404).json({msg: "No competencies found for this program"})
                return;
            }

            let data : string[] = [];
            rows.forEach(row => {
                data.push(row.judul_kompetensi);
            });

            res.status(200).json({msg: "OK", data: data})
        } catch (error) {
            res.status(500).json({msg: error.msg})
        }
    },
    getActivities: async (req, res) => {
        try {
            const { rows } = await postgre.query(`
                SELECT topik.id_topik, topik.nama_topik, kegiatan.id_kegiatan, kegiatan.nama_kegiatan
                FROM program 
                    INNER JOIN topik ON program.id_program = topik.id_program
                    INNER JOIN kegiatan ON topik.id_topik = kegiatan.id_topik
                WHERE program.id_program = $1;`, [req.params.id]);

            if (rows.length === 0) {
                res.status(404).json({msg: "No activities found for this program"})
                return;
            }

            let data : {[key: string]: {id_topik: string, nama_topik: string, kegiatan: any[]}} = {};
            
            rows.forEach(row => {
                if (!data[row.id_topik]) {
                    data[row.id_topik] = {
                        id_topik: row.id_topik,
                        nama_topik: row.nama_topik,
                        kegiatan: []
                    }
                }
                data[row.id_topik].kegiatan.push({
                    id_kegiatan: row.id_kegiatan,
                    nama_kegiatan: row.nama_kegiatan
                });
            });

            res.status(200).json({msg: "OK", data: Object.values(data)})
        } catch (error) {
            res.status(500).json({msg: error.msg})
        }
    }

} 

export default programController;