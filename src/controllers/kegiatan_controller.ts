import { Request, Response } from 'express';
import postgre from '../database';

interface KegiatanController {
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    getInstruksi: (req: Request, res: Response) => Promise<void>;
    getByGuru: (req: Request, res: Response) => Promise<void>;
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
            const idGuru = req.query.id ? req.query.id.toString() : null;
            const dateString = req.query.date ? req.query.date.toString() : null;
            
            console.log('Received input parameters:');
            console.log('idGuru:', idGuru);
            console.log('dateString:', dateString);
            
            if (!idGuru) {
                res.json({msg: "ID Guru is required"});
                return;
            } else if (idGuru && (typeof idGuru !== 'number' || isNaN(parseInt(idGuru)))) {
                res.json({msg: "ID must be a number"});
                return;
            }
            
            const { rows } = await postgre.query(`
                SELECT kegiatan.id_kegiatan, nama_kegiatan, nama_kelas, nama_program, nama_topik, tanggal, waktu
                FROM kegiatan 
                LEFT JOIN jadwal ON kegiatan.id_kegiatan = jadwal.id_kegiatan
                LEFT JOIN kelas ON jadwal.id_kelas = kelas.id_kelas
                LEFT JOIN topik ON topik.id_topik = kegiatan.id_topik
                LEFT JOIN program ON topik.id_program = program.id_program
                WHERE id_guru = $1 AND ($2 IS NULL OR tanggal = $2);
            `, [parseInt(idGuru), dateString]);
        
            res.json({msg: "OK", data: rows});
        
        } catch (error) {
            res.json({msg: error.message});
        }
    },     
}
export default kegiatanController;