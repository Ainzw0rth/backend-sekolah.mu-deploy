import { Request, Response } from 'express';
import postgre from '../database';

interface KontenController {
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
}

const kontenController: KontenController = {
    getAll: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * from konten");
            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({msg: error.msg})
        }
    },
    getById: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * from konten WHERE id_konten $1", [req.params.id]);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({msg: error.msg})
        }
    }
} 

export default kontenController;