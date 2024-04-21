import { Request, Response } from 'express';
import postgre from '../database';

interface EvaluasiController {
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    create: (req: Request, res: Response) => Promise<void>;
    update: (req: Request, res: Response) => Promise<void>;
}

const evaluasiController: EvaluasiController = {
    getAll: async (req, res) => {
        try {
            const { rows } = await postgre.query(`SELECT * FROM evaluasi`);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            console.error('Error fetching evaluasi:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getById: async (req, res) => {
        try {
            if (!req.query.kegiatan && !req.query.murid) {
                res.json({msg: "ID kegiatan or ID murid is required"});
                return;
            }

            if (req.query.kegiatan && req.query.murid) {
                const { rows } = await postgre.query(`SELECT * FROM evaluasi WHERE id_kegiatan = $1 AND id_murid = $2`, [req.query.kegiatan, req.query.murid]);
                res.json({msg: "OK", data: rows})
            } else if (req.query.kegiatan) {
                const { rows } = await postgre.query(`SELECT * FROM evaluasi WHERE id_kegiatan = $1`, [req.query.kegiatan]);
                res.json({msg: "OK", data: rows})
            } else if (req.query.murid) {
                const { rows } = await postgre.query(`SELECT * FROM evaluasi WHERE id_murid = $1`, [req.query.murid]);
                res.json({msg: "OK", data: rows})
            }
        } catch (error) {
            console.log(req.query.kegiatan, req.query.murid)

            res.json({msg: error.msg})
        }
    },

    create: async (req, res) => {
        try {
            const {id_kegiatan, id_murid, presensi, nilai, catatan, feedback, id_karya, id_guru} = req.body;
            if (!id_kegiatan || !id_murid || !id_guru) {
                res.json({msg: "ID kegiatan, ID murid, and ID guru are required"});
                return;
            }

            await postgre.query('INSERT INTO evaluasi (id_kegiatan, id_murid, catatan_kehadiran, penilaian, catatan, feedback, id_karya) VALUES ($1, $2, $3, $4, $5, $6, $7)', [id_kegiatan, id_murid, presensi, nilai, catatan, feedback, id_karya]);

            await postgre.query('INSERT INTO evaluasi_log (id_murid, id_kegiatan, timestamp, editor, action, field, old_value) VALUES ($1, $2, NOW(), $3, $4, $5, $6)', [id_murid, id_kegiatan, id_guru, 'Create', "All", null]);

            res.status(201).json({ message: 'Evaluasi created successfully' });
        } catch (error) {
            console.error('Error creating evaluasi:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    update: async (req, res) => {
        try {
            const id_kegiatan = req.query.kegiatan;
            const id_murid = req.query.murid;
            const { presensi, nilai, catatan, feedback, id_karya, id_guru } = req.body;
            if (!id_guru) {
                res.json({ msg: "ID guru is required" });
                return;
            }
    
            // Get old value
            const { rows } = await postgre.query(`SELECT * FROM evaluasi WHERE id_kegiatan = $1 AND id_murid = $2`, [id_kegiatan, id_murid]);
            const oldData = rows[0];

            let field = [];
            if (presensi) field.push("catatan_kehadiran");
            if (nilai) field.push("penilaian");
            if (catatan) field.push("catatan");
            if (feedback) field.push("feedback");
            if (id_karya) field.push("id_karya");
            
            // Update evaluasi
            await postgre.query(
                'UPDATE evaluasi SET catatan_kehadiran = $3, penilaian = $4, catatan = $5, feedback = $6, id_karya = $7 WHERE id_kegiatan = $1 AND id_murid = $2',
                [id_kegiatan, id_murid, presensi, nilai, catatan, feedback, id_karya]
            );
    
            await postgre.query(
                'INSERT INTO evaluasi_log (id_murid, id_kegiatan, timestamp, editor, action, field, old_value) VALUES ($1, $2, NOW(), $3, $4, $5, $6)',
                [id_murid, id_kegiatan, id_guru, 'Update', field.join(', '), JSON.stringify(oldData)]
            );
    
            res.status(201).json({ message: 'Evaluasi updated successfully' });
        } catch (error) {
            console.error('Error updating evaluasi:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }    
}

export default evaluasiController;