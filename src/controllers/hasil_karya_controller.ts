import { Request, Response } from 'express';
import postgre from '../database';

interface HasilKaryaController {
    getById: (req: Request, res: Response) => Promise<void>;
}

const hasilKaryaController: HasilKaryaController = {
    getById: async (req, res) => {
        try {
            const kegiatanId = req.params.kegiatan_id;
            const muridId = req.params.murid_id;

            const query = `
                SELECT
                    m.nama_murid AS name,
                    k.nama_karya AS fileName,
                    k.file_path AS fileUrl
                FROM
                    murid m
                JOIN
                    karya k ON m.id_murid = k.id_murid
                JOIN
                    evaluasi e ON e.id_karya = k.id_karya
                WHERE
                    e.id_kegiatan = $1
                    AND e.id_murid = $2
            `;
            
            const { rows } = await postgre.query(query, [kegiatanId, muridId]);
            res.json({ msg: "OK", data: rows });
        } catch (error) {
            res.json({ msg: error.msg });
        }
    }
};


export default hasilKaryaController;