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
            const idGuru = req.query.id ? parseInt(req.query.id.toString()) : null;
            const date = req.query.date ? parseInt(req.query.date.toString()) : null;
        
            if (!idGuru && !date) {
                res.json({msg: "ID and/or Date is required"});
                return;
            } else if (typeof idGuru !== 'number' || isNaN(idGuru)) {
                res.json({msg: "ID must be a number"});
                return;
            } else if (typeof date !== 'number' || isNaN(date)) {
                res.json({msg: "Date must be a number"});
                return;
            }
        
            const { rows } = await postgre.query(`
                SELECT id_kegiatan, nama_kegiatan, id_guru, id_jadwal, tanggal, waktu, lokasi, id_topik, id_kelas
                FROM kegiatan JOIN jadwal ON kegiatan.id_kegiatan = jadwal.id_kegiatan
                WHERE id_guru = $1 AND tanggal = $2`, [idGuru, date]);
        
            res.json({msg: "OK", data: rows});
        
        } catch (error) {
            res.json({msg: error.msg});
        }        
    },
}
export default kegiatanController;