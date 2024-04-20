import { Request, Response } from 'express';
import postgre from '../database';

interface TopikController {
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
}

const topikController: TopikController = {
    getAll: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * from topik");
            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({msg: error.msg})
        }
    },
    getById: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * from topik WHERE id_topik = $1", [req.params.id]);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({msg: error.msg})
        }
    }
} 

export default topikController;