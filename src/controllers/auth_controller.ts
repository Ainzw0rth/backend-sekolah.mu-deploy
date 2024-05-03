import { Request, Response } from 'express';
import postgre from '../database';

interface AuthController {
    login: (req: Request, res: Response) => Promise<void>;
}

const authController: AuthController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const { rows } = await postgre.query('SELECT * FROM guru WHERE email = $1 AND password = $2', [email, password]);

            if (rows.length === 0) {
                res.status(404).json({msg: 'Data tidak ditemukan'});
                return;
            }
            
            res.status(200).json({msg: "OK", data: rows[0].id_guru});
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
}

export default authController;