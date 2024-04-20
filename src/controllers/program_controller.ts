import { Request, Response } from 'express';
import postgre from '../database';

interface ProgramController {
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    getByGuru: (req: Request, res: Response) => Promise<void>;
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
            const { rows: programs } = await postgre.query("SELECT * from program WHERE id_program = $1", [req.params.id]);
            const { rows: topik } = await postgre.query(`
                SELECT t.nama_topik AS title, json_agg(json_build_object('title', k.nama_kegiatan, 'url', '#')) AS activities
                FROM topik t
                JOIN kegiatan k ON t.id_topik = k.id_topik
                WHERE t.id_program = $1
                GROUP BY t.nama_topik;
            `, [req.params.id]);
            const { rows: kompetensi } = await postgre.query(`
                SELECT k.judul_kompetensi AS title
                FROM program_kompetensi pk
                JOIN kompetensi k ON pk.id_kompetensi = k.id_kompetensi
                WHERE pk.id_program = $1;
            `, [req.params.id]);

            const result = programs.map(program => ({
                id: program.id_program,
                slug: program.nama_program.toLowerCase().replace(/\s+/g, '-'),
                judul: program.nama_program,
                imgUrl: `https://images.unsplash.com/photo-1613563696485-f64240817218?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`,
                tujuan: JSON.parse(program.tujuan_pembelajaran),
                kompetensi: kompetensi.map(k => k.title),
                periode: {
                    tahun_ajaran: program.tahun_akademik,
                    semester: program.periode_belajar,
                },
                topik: topik.map(({ title, activities }) => ({
                    title,
                    activities: JSON.parse(activities),
                })),
            }));

            res.json({ msg: "OK", data: result });
        } catch (error) {
            res.json({ msg: error.msg });
        }
    },
    getByGuru: async (req, res) => {
        try {
            const { rows } = await postgre.query(`
                SELECT program.id_program, nama_program, periode_belajar, tahun_akademik
                FROM program 
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
} 

export default programController;