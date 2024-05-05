import { Request, Response } from 'express';
import postgre from '../database';
import multer from 'multer';
import path from 'path';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';

interface HasilKaryaController {
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    create: (req: Request, res: Response) => Promise<void>;
    update: (req: Request, res: Response) => Promise<void>;
}


// Multer configuration
// Set up AWS S3
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
  // Multer configuration for S3
  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_BUCKET_NAME,
      key: function(_req: any, file: { originalname: string; }, cb: (arg0: null, arg1: string) => void) {
        cb(null, 'uploads/' + Date.now().toString() + '-' + path.basename(file.originalname));
      }
    }),
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB file size limit
  });

const hasilKaryaController: HasilKaryaController = {
    getAll: async (req, res) => {
        try {
            const { rows } = await postgre.query(`SELECT * FROM karya`);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            console.error('Error fetching hasil karya:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getById: async (req, res) => {
        try {
            if (!req.query.jadwal && !req.query.murid) {
                res.json({msg: "ID jadwal or ID murid is required"});
                return;
            }

            if (req.query.jadwal && req.query.murid) {
                const { rows } = await postgre.query(`SELECT k.*
                FROM karya k
                INNER JOIN evaluasi e ON k.id_karya = e.id_karya
                WHERE e.id_jadwal = $1
                AND e.id_murid = $2`, [req.query.jadwal, req.query.murid]);
                res.json({msg: "OK", data: rows})
            } else if (req.query.jadwal) {
                const { rows } = await postgre.query(`SELECT k.*
                FROM karya k
                INNER JOIN evaluasi e ON k.id_karya = e.id_karya
                WHERE e.id_jadwal = $1`, [req.query.jadwal]);
                res.json({msg: "OK", data: rows})
            } else if (req.query.murid) {
                const { rows } = await postgre.query(`SELECT * FROM karya WHERE id_murid = $1`, [req.query.murid]);
                res.json({msg: "OK", data: rows})
            }
        } catch (error) {
            console.log(req.query.jadwal, req.query.murid)

            res.json({msg: error.msg})
        }
    },

    create: async (req, res) => {
        try {
            const {id_jadwal, id_murid, nama_karya, tipe_file, file_path, id_guru} = req.body;
            if (!id_jadwal || !id_murid || !id_guru) {
                res.json({msg: "ID jadwal, ID murid, and ID guru are required"});
                return;
            }

            const id_karya = await postgre.query('INSERT INTO karya (nama_karya, id_murid, tipe_file, file_path) VALUES ($1, $2, $3, $4) RETURNING id_karya', [nama_karya, id_murid, tipe_file, file_path]);   
            await postgre.query('UPDATE evaluasi SET id_karya = $1 WHERE id_jadwal = $2 AND id_murid = $3', [id_karya.rows[0].id_karya, id_jadwal, id_murid])       
            await postgre.query('INSERT INTO evaluasi_log (id_murid, id_jadwal, timestamp, editor, action, field, old_value) VALUES ($1, $2, NOW(), $3, $4, $5, $6)', [id_murid, id_jadwal, id_guru, 'Create', 'All', null]);

            res.status(201).json({ message: 'Hasil karya created successfully' });
        } catch (error) {
            console.error('Error creating hasil karya:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    update: async (req, res) => {
        try {
            const id_jadwal = req.query.jadwal;
            const id_murid = req.query.murid;
            const id_guru = req.query.guru;
    
            if (!id_guru) {
                res.json({ msg: "ID guru is required" });
                return;
            }
    
            // Handle file upload with Multer
            upload.single('file')(req, res, async (err) => {
                if (err) {
                    console.error('Error uploading file:', err);
                    return res.status(500).json({ error: 'Error uploading file' });
                }
    
                try {
                    // Get old value
                    const { rows } = await postgre.query(`SELECT k.*
                    FROM karya k
                    INNER JOIN evaluasi e ON k.id_karya = e.id_karya
                    WHERE e.id_jadwal = $1
                    AND e.id_murid = $2`, [id_jadwal, id_murid]);
                    const oldData = rows[0];
    
                    let field = [];
                    if (req.file && req.file.filename) field.push("nama_karya");
                    if (req.file && req.file.mimetype) field.push("tipe_file");
                    if (req.file) field.push("file_path");
    
                    // Update data
                    await postgre.query(
                        'UPDATE karya SET nama_karya = $1, tipe_file = $2, file_path = $3 WHERE id_karya = $4',
                        [req.file ? req.file.filename : oldData.nama_karya, req.file ? req.file.mimetype : oldData.tipe_file, req.file ? req.file.path : oldData.file_path, oldData.id_karya]
                    );
    
                    await postgre.query(
                        'INSERT INTO evaluasi_log (id_murid, id_jadwal, timestamp, editor, action, field, old_value) VALUES ($1, $2, NOW(), $3, $4, $5, $6)',
                        [id_murid, id_jadwal, id_guru, 'Update', field.join(', '), JSON.stringify(oldData)]
                    );
    
                    res.status(201).json({ message: 'Hasil karya updated successfully' });
                } catch (error) {
                    console.error('Error updating hasil karya:', error);
                    res.status(500).json({ error: 'Internal server error' });
                }
            });
        } catch (error) {
            console.error('Error updating hasil karya:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }    
}

export default hasilKaryaController;