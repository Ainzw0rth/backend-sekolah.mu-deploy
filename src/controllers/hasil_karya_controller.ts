import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import postgre from '../database';

interface HasilKaryaController {
    getById: (req: Request, res: Response) => Promise<void>;
    uploadFile: (req: Request, res: Response) => Promise<void>; // Define a new method for file upload
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
            res.status(500).json({ msg: error.message });
        }
    },
    uploadFile: async (req, res) => {
        try {
            const multerUpload = multer({
                storage: multer.memoryStorage(),
                fileFilter: (req, file, cb: FileFilterCallback) => {
                    const fileTypes = /jpeg|jpg|png|gif/;
                    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
                    const mimeType = fileTypes.test(file.mimetype);
                    if (extname && mimeType) {
                        cb(null, true);
                    } else {
                        cb(new Error("Only images are allowed"));
                    }
                }
            }).single('file');

            multerUpload(req, res, async (err: any) => {
                if (err) {
                    res.status(400).json({ msg: err.message });
                    return;
                }

                const file = req.file;
                if (!file) {
                    res.status(400).json({ msg: "No file uploaded" });
                    return;
                }

                const fileName = uuidv4() + path.extname(file.originalname);
                const filePath = path.join(__dirname, '../uploads', fileName);

                fs.writeFile(filePath, file.buffer, async (err) => {
                    if (err) {
                        res.status(500).json({ msg: "Failed to save file" });
                        return;
                    }

                    try {
                        const query = `
                            INSERT INTO karya (nama_karya, id_murid, tipe_file, file_path) VALUES ($1, $2, $3, $4)
                        `;
                        await postgre.query(query, [file.originalname, req.body.muridId, path.extname(file.originalname), filePath]);
                        res.json({ msg: "File uploaded successfully" });
                    } catch (error) {
                        res.status(500).json({ msg: error.message });
                    }
                });
            });
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
};

export default hasilKaryaController;