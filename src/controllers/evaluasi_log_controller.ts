import { Request, Response } from 'express';
import postgre from '../database';

interface EvaluasiLogController {
    getAll: (req: Request, res: Response) => Promise<void>;
    create: (req: Request, res: Response) => Promise<void>;
}

const evaluasilogController: EvaluasiLogController = {
    getAll: async (req, res) => {
        try {
            const { rows } = await postgre.query(`SELECT * FROM evaluasi_log`);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            console.error('Error fetching evaluasi logs:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    create: async (req, res) => {
        try {
            const { id_murid, id_jadwal, editor, action, field, old_value } = req.body;
            await postgre.query('INSERT INTO evaluasi_log (id_log, id_murid, id_jadwal, timestamp, editor, action, field, old_value) VALUES (0, $1, $2, NOW(), $3, $4, $5, $6)', [id_murid, id_jadwal, editor, action, field, old_value]);
            
            res.status(201).json({ message: 'Evaluasi log created successfully' });
        } catch (error) {
            console.error('Error creating evaluasi log:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
}

export default evaluasilogController;