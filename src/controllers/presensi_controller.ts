import { Request, Response } from 'express';
import postgre from '../database';

interface PresensiController {
    getForKegiatan: (req: Request, res: Response) => Promise<void>;
    updatePresensiKegiatan: (req: Request, res: Response) => Promise<void>;
}

const presensiController: PresensiController = {
    getForKegiatan: async (req, res) => {
        try {
            const { rows } = await postgre.query(`
                SELECT m.id_murid, m.nama_murid, m.path_foto_profil, e.catatan_kehadiran
                FROM evaluasi e
                JOIN murid m ON e.id_murid = m.id_murid
                WHERE e.id_jadwal = $1;
            `, [req.params.id]);
            
            if (rows.length === 0) {
                res.status(404).json({ msg: 'Data tidak ditemukan', data: [] });
                return;
            }

            res.status(200).json({ data: rows });
            return;
        } catch (error) {
            console.error('Error fetching presensi:', error);
            res.status(500).json({ msg: error.msg, data: [] });
            return;
        }
    },
    updatePresensiKegiatan: async (req, res) => {
        const students = req.body;
        for (const student of students) {
            if (!student.id_murid || !student.catatan_kehadiran) {  
                res.status(400).json({ msg: 'Invalid request, missing id or catatan_kehadiran' });
                return;
            }
        }

        if (!req.query.guru) {
            res.status(400).json({ msg: 'Invalid request! No id_guru was provided, use ?guru=<id_guru>' });
            return;
        }

        const oldStudents = await postgre.query(`
            SELECT * FROM evaluasi WHERE id_jadwal = $1;
        `, [req.params.id]);
        
        try {
            await postgre.query(`BEGIN`);

            const updates = students.map((student: any) => `
                            WHEN id_murid = ${student.id_murid} THEN '${student.catatan_kehadiran}'
                        `).join('\n');

            const logs = students.map((student: any) => {
                const timestamp = new Date().toISOString();
                const editor = req.query.guru;
                const action = 'Update';
                const oldValue = oldStudents.rows.find((s: any) => s.id_murid === student.id_murid).catatan_kehadiran;
                const field = 'catatan_kehadiran';

                return `
                    VALUES (${req.params.id}, ${student.id_murid}, '${timestamp}', '${editor}', '${action}', '${field}', '${oldValue}');
                `;
            }).join('\n');
                

            await postgre.query(`
                UPDATE evaluasi
                SET catatan_kehadiran = CASE
                    ${updates}
                    ELSE catatan_kehadiran
                END
                WHERE id_jadwal = $1;
            `, [req.params.id]);

            await postgre.query(`
                INSERT INTO evaluasi_log (id_jadwal, id_murid, timestamp, editor, action, field, old_value)
                ${logs}
            `);

            await postgre.query(`COMMIT`);
        } catch (error) {
            await postgre.query(`ROLLBACK`);
            console.error('Error updating presensi:', error);
            res.status(500).json({ msg: error.msg });
            return;
        }
        res.status(200).json({ msg: 'Data berhasil diubah' });
    }
}

export default presensiController;