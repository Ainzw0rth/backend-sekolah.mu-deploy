import { Request, Response } from 'express';
import postgre from '../database';

interface KegiatanController {
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    getInstruksi: (req: Request, res: Response) => Promise<void>;
    getByGuru: (req: Request, res: Response) => Promise<void>;
    getByTanggal: (req: Request, res: Response) => Promise<void>;
    getPercentage: (req: Request, res: Response) => Promise<void>;
    getMurid: (req: Request, res: Response) => Promise<void>;
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
            const { rows } = await postgre.query("SELECT * from kegiatan WHERE id_kegiatan = $1", [req.params.id]);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({msg: error.msg})
        }
    },
    getInstruksi: async (req, res) => {
        try {    
            
            if (!req.query.id) {
                res.json({msg: "ID is required"});
                return;
            } else if (typeof req.query.id !== 'string' || isNaN(parseInt(req.query.id.toString()))) {
                res.json({msg: "ID must be a number"});
                return;
            } else if (!req.query.type || (req.query.type !== "guru" && req.query.type !== "murid")) {
                res.json({msg: "Type must be either 'guru' or 'murid'"});
                return;
            }
    
            let instruksiField;
            if (req.query.type === "guru") {
                instruksiField = "instruksi_guru";
            } else {
                instruksiField = "instruksi_murid";
            }
    
            const { rows } = await postgre.query(`SELECT ${instruksiField} FROM kegiatan WHERE id_kegiatan = $1`, [req.query.id.toString()]);
            res.json({msg: "OK", data: rows});
        } catch (error) {
            res.json({msg: error.msg});
        }
    },
    getByGuru: async (req, res) => {
        try {
            const idGuru = req.query.id ? parseInt(req.query.id.toString()) : null;

            if (!idGuru) {
                res.json({msg: "ID Guru is required"});
                return;
            } else if (isNaN(idGuru)) {
                res.json({msg: "ID must be a number"});
                return;
            }

            const query = `
                SELECT 
                    kegiatan.id_kegiatan, 
                    nama_kegiatan, 
                    nama_kelas, 
                    program.id_program,
                    nama_program, 
                    topik.id_topik,
                    nama_topik, 
                    tanggal, 
                    waktu
                FROM kegiatan 
                    INNER JOIN topik 
                        ON topik.id_topik = kegiatan.id_topik
                    INNER JOIN program 
                        ON topik.id_program = program.id_program
                    INNER JOIN jadwal 
                        ON kegiatan.id_kegiatan = jadwal.id_kegiatan
                    INNER JOIN kelas 
                        ON jadwal.id_kelas = kelas.id_kelas
                WHERE id_guru = $1`;

            const { rows } = await postgre.query(query, [idGuru]);
        
            res.json({msg: "OK", data: rows});
        
        } catch (error) {
            res.json({msg: error.message});
        }
    },    
    getByTanggal: async (req, res) => {
        try {
            const tanggal = req.query.tanggal ? req.query.tanggal.toString() : null;
            
            console.log ("tanggal: ", tanggal)

            if (!tanggal) {
                res.json({msg: "Tanggal is required"});
                return;
            }

            const tanggalRegex = /^'\d{4}-\d{2}-\d{2}'$/;

            if (!tanggalRegex.test(tanggal)) {
                res.json({ msg: "Format tanggal tidak valid. Format seharusnya: YYYY-MM-DD" });
                return;
            }

            const query = `
                SELECT kegiatan.id_kegiatan, nama_kegiatan, nama_kelas, nama_program, nama_topik, tanggal, waktu
                FROM kegiatan 
                LEFT JOIN jadwal ON kegiatan.id_kegiatan = jadwal.id_kegiatan
                LEFT JOIN kelas ON jadwal.id_kelas = kelas.id_kelas
                LEFT JOIN topik ON topik.id_topik = kegiatan.id_topik
                LEFT JOIN program ON topik.id_program = program.id_program
                WHERE jadwal.tanggal = $1`;

            const { rows } = await postgre.query(query, [tanggal]);
        
            res.json({msg: "OK", data: rows});
        
        } catch (error) {
            res.json({msg: error.message});
        }
    },        
    getPercentage: async (req, res) => {
        try {
            const idKegiatan = req.query.id ? parseInt(req.query.id.toString()) : null;

            if (!idKegiatan) {
                res.json({msg: "ID Kegiatan is required"});
                return;
            } else if (isNaN(idKegiatan)) {
                res.json({msg: "ID must be a number"});
                return;
            }

            const query = `
                SELECT 
                    COUNT(*) AS total_rows,
                    COUNT(CASE WHEN catatan_kehadiran IS NULL THEN 1 END) AS null_catatan_kehadiran,
                    COUNT(CASE WHEN penilaian IS NULL THEN 1 END) AS null_penilaian,
                    COUNT(CASE WHEN catatan IS NULL THEN 1 END) AS null_catatan,
                    COUNT(CASE WHEN feedback IS NULL THEN 1 END) AS null_feedback,
                    COUNT(CASE WHEN id_karya IS NULL THEN 1 END) AS null_id_karya
                    FROM kegiatan LEFT JOIN evaluasi on kegiatan.id_kegiatan = evaluasi.id_kegiatan
                    WHERE kegiatan.id_kegiatan = $1`;

            const { rows } = await postgre.query(query, [idKegiatan]);
        
            res.json({msg: "OK", data: rows});
        
        } catch (error) {
            res.json({msg: error.message});
        }
    }, 
    getMurid: async (req, res) => {
        try {
            const idKegiatan = req.params.id;
            
            const query = `
                SELECT kegiatan.id_kegiatan, murid_kelas.id_kelas, murid.id_murid, murid.nama_murid, kegiatan.id_guru
                FROM kegiatan 
                LEFT JOIN jadwal ON kegiatan.id_kegiatan = jadwal.id_kegiatan
                LEFT JOIN murid_kelas ON jadwal.id_kelas = murid_kelas.id_kelas
                LEFT JOIN murid ON murid_kelas.id_murid = murid.id_murid
                WHERE kegiatan.id_kegiatan = $1`;

            const { rows } = await postgre.query(query, [idKegiatan]);
        
            res.json({msg: "OK", data: rows});
        
        } catch (error) {
            res.json({msg: error.message});
        }
    },   
}
export default kegiatanController;