import { Request, Response } from 'express';
import postgre from '../database';

interface JadwalController {
    getAll: (req: Request, res: Response) => Promise<void>;
}

const jadwalController: JadwalController = {
    getAll: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * from jadwal");
            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({msg: error.msg})
        }
    }
}
export default jadwalController;