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
            const { rows } = await postgre.query("SELECT * from program WHERE id_program = $1", [req.params.id]);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({msg: error.msg})
        }
    },
    getByGuru: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * from program LEFT JOIN kelas ON kelas.program_id = program.program_id WHERE id_program = $1", [req.params.id]);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({msg: error.msg})
        }
    },    
} 

export default programController;