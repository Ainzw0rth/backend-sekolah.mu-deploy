import { Request, Response } from 'express';
import postgre from '../database';

interface TugasController {
    getAll: (req: Request, res: Response) => Promise<void>;

}
/* req body:
    - id_guru
    - id_murid

*/
const tugasController: TugasController = {
    getAll: async (req, res) => {
        try {
            // search list of id_kegiatan
            const { rows } = await postgre.query(`
                SELECT id_kegiatan from kegiatan
                WHERE id_guru = $1
            `);
            

        } catch (error) {
            res.json({msg: error.msg})
        }
    }
}


export default tugasController;