import { Request, Response } from 'express';
import postgre from '../database';

interface ProfilController {
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    getAllBadges: (req: Request, res: Response) => Promise<void>;
    addBadge: (req: Request, res: Response) => Promise<void>;
    checkBadgeStreak: (req: Request, res: Response) => Promise<void>;
    checkBadgeStreakMaster: (req: Request, res: Response) => Promise<void>;
    checkBadgeStreakKing: (req: Request, res: Response) => Promise<void>;
    checkBadgeGocap: (req: Request, res: Response) => Promise<void>;
    checkBadgeCepek: (req: Request, res: Response) => Promise<void>;
}

const profilController: ProfilController = {
    getAll: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * from guru");
            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({msg: error.msg})
        }
    },
    getById: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * from guru WHERE id_guru = $1", [req.params.id]);
            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({msg: error.msg})
        }
    },
    getAllBadges: async (req, res) => {
        try {
            const idGuru = req.params.id;

            const query = `
                SELECT badge.nama_badge, badge.deskripsi, badge.path_badge
                FROM guru
                LEFT JOIN badge_guru on guru.id_guru = badge_guru.id_guru
                LEFT JOIN badge on badge_guru.id_badge = badge.id_badge
                WHERE guru.id_guru = $1`;
                
                const { rows } = await postgre.query(query, [idGuru]);
        
                res.json({msg: "OK", data: rows});
        } catch (error) {
            res.json({msg: error.msg});
        }
    }, 
    addBadge: async (req, res) => {
        try {
            const { id_badge, id_guru } = req.body;
    
            if (!id_badge || !id_guru) {
                res.status(400).json({ error: 'id_badge and id_guru are required' });
            }
    
            await postgre.query('INSERT INTO badge_guru (id_badge, id_guru) VALUES ($1, $2)', [id_badge, id_guru]);
            res.status(200).json({ message: 'Badge added successfully' });
        } catch (error) {
            console.error('Error adding badge:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    checkBadgeStreak: async (req, res) => {
        try {
            const idGuru = req.params.id;

            // initial check if the guru already has the badge
            const badgeCheckQuery = `
                SELECT *
                FROM badge_guru
                    LEFT JOIN badge on badge.id_badge = badge_guru.id_badge
                WHERE badge_guru.id_guru = $1 AND nama_badge = 'Streak' 
            `;

            const initialresult = await postgre.query(badgeCheckQuery, [idGuru]);
            
            if (initialresult.rows.length > 0) {
                const query = `
                    SELECT 
                        kegiatan.id_kegiatan,
                        COUNT(*) AS total_rows,
                        COUNT(CASE WHEN catatan_kehadiran IS NULL THEN 1 END) AS null_catatan_kehadiran,
                        COUNT(CASE WHEN penilaian IS NULL THEN 1 END) AS null_penilaian,
                        COUNT(CASE WHEN catatan IS NULL THEN 1 END) AS null_catatan,
                        COUNT(CASE WHEN feedback IS NULL THEN 1 END) AS null_feedback,
                        COUNT(CASE WHEN id_karya IS NULL THEN 1 END) AS null_id_karya
                    FROM kegiatan 
                    LEFT JOIN evaluasi on kegiatan.id_kegiatan = evaluasi.id_kegiatan
                    WHERE kegiatan.id_guru = $1
                    GROUP BY kegiatan.id_kegiatan
                    HAVING 
                        COUNT(CASE WHEN catatan_kehadiran IS NULL THEN 1 END) = 0 AND
                        COUNT(CASE WHEN penilaian IS NULL THEN 1 END) = 0 AND
                        COUNT(CASE WHEN catatan IS NULL THEN 1 END) = 0 AND
                        COUNT(CASE WHEN feedback IS NULL THEN 1 END) = 0 AND
                        COUNT(CASE WHEN id_karya IS NULL THEN 1 END) = 0`;
    
                const result = await postgre.query(query, [idGuru]);
                const rowCount = result.rows.length;
    
                res.json({msg: "OK", data: rowCount == 0 ?  true : false});
            
            } else {
                res.json({msg: "OK", data: false});
            }
        } catch (error) {
            res.json({msg: error.msg});
        }
    },
    checkBadgeStreakMaster: async (req, res) => {
        try {
            const idGuru = req.params.id;

            const badgeCheckQuery = `
                SELECT *
                FROM badge_guru
                    LEFT JOIN badge on badge.id_badge = badge_guru.id_badge
                WHERE badge_guru.id_guru = $1 AND nama_badge = 'Streak Master' 
            `;

            const initialresult = await postgre.query(badgeCheckQuery, [idGuru]);

            if (initialresult.rows.length > 0) {
                const query = `
                SELECT 
                    COUNT(*) AS total_rows,
                    COUNT(CASE WHEN catatan_kehadiran IS NULL THEN 1 END) AS null_catatan_kehadiran,
                    COUNT(CASE WHEN penilaian IS NULL THEN 1 END) AS null_penilaian,
                    COUNT(CASE WHEN catatan IS NULL THEN 1 END) AS null_catatan,
                    COUNT(CASE WHEN feedback IS NULL THEN 1 END) AS null_feedback,
                    COUNT(CASE WHEN id_karya IS NULL THEN 1 END) AS null_id_karya
                FROM kegiatan 
                LEFT JOIN evaluasi on kegiatan.id_kegiatan = evaluasi.id_kegiatan
                WHERE kegiatan.id_guru = $1 AND kegiatan.id_kegiatan IN (
                    SELECT kegiatan.id_kegiatan
                    FROM jadwal
                    LEFT JOIN kegiatan on jadwal.id_kegiatan = kegiatan.id_kegiatan
                    WHERE kegiatan.id_guru = $1 AND jadwal.tanggal BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
                )`;
    
                const { rows } = await postgre.query(query, [idGuru]);
                
                if (rows[0].null_catatan_kehadiran == 0 && rows[0].null_penilaian == 0 && rows[0].null_catatan == 0 && rows[0].null_feedback == 0 && rows[0].null_id_karya == 0 && rows[0].total_rows > 0) {
                    res.json({msg: "OK", data: true});
                } else {
                    res.json({msg: "OK", data: false});
                }
            } else {
                res.json({msg: "OK", data: false});
            }
        } catch (error) {
            res.json({msg: error.msg});
        }
    },
    checkBadgeStreakKing: async (req, res) => {
        try {
            const idGuru = req.params.id;

            const badgeCheckQuery = `
                SELECT *
                FROM badge_guru
                    LEFT JOIN badge on badge.id_badge = badge_guru.id_badge
                WHERE badge_guru.id_guru = $1 AND nama_badge = 'Streak King' 
            `;

            const initialresult = await postgre.query(badgeCheckQuery, [idGuru]);

            if (initialresult.rows.length > 0) {
                const query = `
                SELECT 
                    COUNT(*) AS total_rows,
                    COUNT(CASE WHEN catatan_kehadiran IS NULL THEN 1 END) AS null_catatan_kehadiran,
                    COUNT(CASE WHEN penilaian IS NULL THEN 1 END) AS null_penilaian,
                    COUNT(CASE WHEN catatan IS NULL THEN 1 END) AS null_catatan,
                    COUNT(CASE WHEN feedback IS NULL THEN 1 END) AS null_feedback,
                    COUNT(CASE WHEN id_karya IS NULL THEN 1 END) AS null_id_karya
                FROM kegiatan 
                LEFT JOIN evaluasi on kegiatan.id_kegiatan = evaluasi.id_kegiatan
                WHERE kegiatan.id_guru = $1 AND kegiatan.id_kegiatan IN (
                    SELECT kegiatan.id_kegiatan
                    FROM jadwal
                    LEFT JOIN kegiatan on jadwal.id_kegiatan = kegiatan.id_kegiatan
                    WHERE kegiatan.id_guru = $1 AND jadwal.tanggal BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
                )`;
    
                const { rows } = await postgre.query(query, [idGuru]);
                
                if (rows[0].null_catatan_kehadiran == 0 && rows[0].null_penilaian == 0 && rows[0].null_catatan == 0 && rows[0].null_feedback == 0 && rows[0].null_id_karya == 0 && rows[0].total_rows > 0) {
                    res.json({msg: "OK", data: true});
                } else {
                    res.json({msg: "OK", data: false});
                }
            } else {
                res.json({msg: "OK", data: false});
            }
        } catch (error) {
            res.json({msg: error.msg});
        }
    },
    checkBadgeGocap: async (req, res) => {
        try {
            const idGuru = req.params.id;

            // initial check if the guru already has the badge
            const badgeCheckQuery = `
                SELECT *
                FROM badge_guru
                    LEFT JOIN badge on badge.id_badge = badge_guru.id_badge
                WHERE badge_guru.id_guru = $1 AND nama_badge = 'Gocap' 
            `;

            const initialresult = await postgre.query(badgeCheckQuery, [idGuru]);
            
            if (initialresult.rows.length > 0) {
                const query = `
                SELECT COUNT(*)
                FROM kegiatan 
                LEFT JOIN evaluasi on kegiatan.id_kegiatan = evaluasi.id_kegiatan
                WHERE kegiatan.id_guru = $1 AND catatan_kehadiran IS NOT NULL AND penilaian IS NOT NULL AND catatan IS NOT NULL AND feedback IS NOT NULL AND id_karya IS NOT NULL`;
    
                const { rows } = await postgre.query(query, [idGuru]);
    
                res.json({msg: "OK", data: rows[0].count >= 50 ?  true : false});
            } else {
                res.json({msg: "OK", data: false});
            }
        } catch (error) {
            res.json({msg: error.msg});
        }
    },
    checkBadgeCepek: async (req, res) => {
        try {
            const idGuru = req.params.id;

            // initial check if the guru already has the badge
            const badgeCheckQuery = `
                SELECT *
                FROM badge_guru
                    LEFT JOIN badge on badge.id_badge = badge_guru.id_badge
                WHERE badge_guru.id_guru = $1 AND nama_badge = 'Cepek' 
            `;

            const initialresult = await postgre.query(badgeCheckQuery, [idGuru]);
            
            if (initialresult.rows.length > 0) {
                const query = `
                SELECT COUNT(*)
                FROM kegiatan 
                LEFT JOIN evaluasi on kegiatan.id_kegiatan = evaluasi.id_kegiatan
                WHERE kegiatan.id_guru = $1 AND catatan_kehadiran IS NOT NULL AND penilaian IS NOT NULL AND catatan IS NOT NULL AND feedback IS NOT NULL AND id_karya IS NOT NULL`;
    
                const { rows } = await postgre.query(query, [idGuru]);
    
                res.json({msg: "OK", data: rows[0].count >= 100 ?  true : false});
            } else {
                res.json({msg: "OK", data: false});
            }
        } catch (error) {
            res.json({msg: error.msg});
        }
    }
}

export default profilController;