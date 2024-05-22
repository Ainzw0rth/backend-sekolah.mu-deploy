import { Request, Response } from 'express';
import postgre from '../database';

interface EvaluasiController {
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    getAllPendingByGuru: (req: Request, res: Response) => Promise<void>;
    create: (req: Request, res: Response) => Promise<void>;
    update: (req: Request, res: Response) => Promise<void>;
    getStudentUnpresenced: (req: Request, res: Response) => Promise<void>;
    getStudentUngraded: (req: Request, res: Response) => Promise<void>;
    getStudentUncommented: (req: Request, res: Response) => Promise<void>;
    getStudentUnfeedbacked: (req: Request, res: Response) => Promise<void>;
}

const evaluasiController: EvaluasiController = {
    getAll: async (req, res) => {
        try {
            const { rows } = await postgre.query(`SELECT * FROM evaluasi`);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            console.error('Error fetching evaluasi:', error);
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
                const { rows } = await postgre.query(`SELECT * FROM evaluasi WHERE id_jadwal = $1 AND id_murid = $2`, [req.query.jadwal, req.query.murid]);
                res.json({msg: "OK", data: rows})
            } else if (req.query.jadwal) {
                const { rows } = await postgre.query(`SELECT * FROM evaluasi WHERE id_jadwal = $1`, [req.query.jadwal]);
                res.json({msg: "OK", data: rows})
            } else if (req.query.murid) {
                const { rows } = await postgre.query(`SELECT * FROM evaluasi WHERE id_murid = $1`, [req.query.murid]);
                res.json({msg: "OK", data: rows})
            }
        } catch (error) {
            console.log(req.query.jadwal, req.query.murid)

            res.json({msg: error.msg})
        }
    },

    /*
        req.body contain id_guru

        get semua instance jadwal yang evaluasinya ada yang belum diisi

    */
    getAllPendingByGuru: async (req, res) => {
        const idGuru = req.query.id_guru ? req.query.id_guru.toString() : null;
        const count = req.query.count ? parseInt(req.query.count.toString()) : null;
    
        if (idGuru === null) {
            res.json({ msg: "ID guru is required" });
            return;
        }
    
        try {
            let query = `
                SELECT DISTINCT 
                    j.id_jadwal, 
                    k.id_kegiatan,
                    k.nama_kegiatan, 
                    j.tanggal, 
                    j.waktu,
                    c.nama_kelas, 
                    p.id_program,
                    p.nama_program, 
                    t.id_topik,
                    t.nama_topik
                FROM kegiatan k
                JOIN jadwal j ON j.id_kegiatan = k.id_kegiatan
                JOIN evaluasi e ON j.id_jadwal = e.id_jadwal
                JOIN topik t ON k.id_topik = t.id_topik
                JOIN program p ON t.id_program = p.id_program
                JOIN kelas c ON j.id_kelas = c.id_kelas
                WHERE k.id_guru = $1 AND
                (catatan_kehadiran IS NULL
                OR penilaian IS NULL
                OR catatan IS NULL
                OR feedback IS NULL)`;
    
            // If count is provided, limit the number of rows returned
            if (count !== null && !isNaN(count)) {
                query += ` LIMIT $2`;
                const { rows } = await postgre.query(query, [idGuru, count]);
                res.json({ msg: "OK", data: rows });
            } else {
                const { rows } = await postgre.query(query, [idGuru]);
                res.json({ msg: "OK", data: rows });
            }
        } catch (error) {
            console.error('Error fetching evaluasi:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }, 

    create: async (req, res) => {
        try {
            const {id_jadwal, id_murid, presensi, nilai, catatan, feedback, id_karya, id_guru} = req.body;
            if (!id_jadwal || !id_murid || !id_guru) {
                res.json({msg: "ID jadwal, ID murid, and ID guru are required"});
                return;
            }

            await postgre.query('INSERT INTO evaluasi (id_jadwal, id_murid, catatan_kehadiran, penilaian, catatan, feedback, id_karya) VALUES ($1, $2, $3, $4, $5, $6, $7)', [id_jadwal, id_murid, presensi, nilai, catatan, feedback, id_karya]);

            await postgre.query('INSERT INTO evaluasi_log (id_murid, id_jadwal, timestamp, editor, action, field, old_value) VALUES ($1, $2, NOW(), $3, $4, $5, $6)', [id_murid, id_jadwal, id_guru, 'Create', "All", null]);

            res.status(201).json({ message: 'Evaluasi created successfully' });
        } catch (error) {
            console.error('Error creating evaluasi:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    update: async (req, res) => {
        try {
            const id_jadwal = req.query.jadwal;
            const id_murid = req.query.murid;
            const { nilai, catatan, feedback, id_guru } = req.body;
            if (!id_guru) {
                res.json({ msg: "ID guru is required" });
                return;
            }
    
            // Get old value
            const { rows } = await postgre.query(`SELECT * FROM evaluasi WHERE id_jadwal = $1 AND id_murid = $2`, [id_jadwal, id_murid]);
            const oldData = rows[0];

            let field = [];
            if (nilai) field.push("penilaian");
            if (catatan) field.push("catatan");
            if (feedback) field.push("feedback");
            
            // Update evaluasi
            await postgre.query(
                'UPDATE evaluasi SET penilaian = $3, catatan = $4, feedback = $5 WHERE id_jadwal = $1 AND id_murid = $2',
                [id_jadwal, id_murid, nilai, catatan, feedback]
            );
    
            await postgre.query(
                'INSERT INTO evaluasi_log (id_murid, id_jadwal, timestamp, editor, action, field, old_value) VALUES ($1, $2, NOW(), $3, $4, $5, $6)',
                [id_murid, id_jadwal, id_guru, 'Update', field.join(', '), JSON.stringify(oldData)]
            );
    
            res.status(201).json({ message: 'Evaluasi updated successfully' });
        } catch (error) {
            console.error('Error updating evaluasi:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    getStudentUnpresenced: async (_req, res) => {
        try {
            const { rows } = await postgre.query(`
            SELECT murid.nama_murid, jadwal.id_kegiatan, kegiatan.nama_kegiatan, jadwal.tanggal
            FROM evaluasi
            JOIN murid ON evaluasi.id_murid = murid.id_murid
            JOIN jadwal ON evaluasi.id_jadwal = jadwal.id_jadwal
            JOIN kegiatan ON jadwal.id_kegiatan = kegiatan.id_kegiatan
            WHERE evaluasi.catatan_kehadiran IS NULL;
            `);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            console.error('Error fetching unprecensed student:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    getStudentUngraded: async (_req, res) => {
        try {
            const { rows } = await postgre.query(`
            SELECT murid.nama_murid, jadwal.id_kegiatan, kegiatan.nama_kegiatan, jadwal.tanggal
            FROM evaluasi
            JOIN murid ON evaluasi.id_murid = murid.id_murid
            JOIN jadwal ON evaluasi.id_jadwal = jadwal.id_jadwal
            JOIN kegiatan ON jadwal.id_kegiatan = kegiatan.id_kegiatan
            WHERE evaluasi.penilaian IS NULL;
            `);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            console.error('Error fetching ungraded student:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    getStudentUncommented: async (_req, res) => {
        try {
            const { rows } = await postgre.query(`
            SELECT murid.nama_murid, jadwal.id_kegiatan, kegiatan.nama_kegiatan, jadwal.tanggal
            FROM evaluasi
            JOIN murid ON evaluasi.id_murid = murid.id_murid
            JOIN jadwal ON evaluasi.id_jadwal = jadwal.id_jadwal
            JOIN kegiatan ON jadwal.id_kegiatan = kegiatan.id_kegiatan
            WHERE evaluasi.catatan IS NULL;
            `);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            console.error('Error fetching unevaluated student:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    getStudentUnfeedbacked: async (_req, res) => {
        try {
            const { rows } = await postgre.query(`
            SELECT murid.nama_murid, jadwal.id_kegiatan, kegiatan.nama_kegiatan, jadwal.tanggal
            FROM evaluasi
            JOIN murid ON evaluasi.id_murid = murid.id_murid
            JOIN jadwal ON evaluasi.id_jadwal = jadwal.id_jadwal
            JOIN kegiatan ON jadwal.id_kegiatan = kegiatan.id_kegiatan
            WHERE evaluasi.feedback IS NULL;
            `);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            console.error('Error fetching unfeedbacked student:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default evaluasiController;