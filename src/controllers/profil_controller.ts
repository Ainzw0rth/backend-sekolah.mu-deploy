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
    checkBadgeKonsisten: (req: Request, res: Response) => Promise<void>;
    checkBadgeAmbis: (req: Request, res: Response) => Promise<void>;
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
                SELECT badge.id_badge, badge.nama_badge, badge.deskripsi, badge.path_badge
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
                    j.tanggal,
                    COUNT(*) = SUM(
                        CASE 
                            WHEN e.catatan_kehadiran IS NOT NULL 
                                AND e.penilaian IS NOT NULL
                                AND e.catatan IS NOT NULL
                                AND e.feedback IS NOT NULL
                                AND e.id_karya IS NOT NULL 
                            THEN 1 
                            ELSE 0 
                        END
                    ) AS all_complete
                FROM 
                    evaluasi e
                JOIN 
                    jadwal j ON e.id_jadwal = j.id_jadwal
                JOIN 
                    kegiatan k ON j.id_kegiatan = k.id_kegiatan
                WHERE 
                    k.id_guru = $1
                GROUP BY 
                    j.tanggal
                ORDER BY 
                    j.tanggal ASC`;
    
                const { rows } = await postgre.query(query, [idGuru]);
                
                let exists = false;

                for (const row of rows) {
                    if (row.all_present) {
                        exists = true;
                    }
                }

                if (exists) {
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
                    j.tanggal,
                    COUNT(*) = SUM(
                        CASE 
                            WHEN e.catatan_kehadiran IS NOT NULL 
                                AND e.penilaian IS NOT NULL
                                AND e.catatan IS NOT NULL
                                AND e.feedback IS NOT NULL
                                AND e.id_karya IS NOT NULL 
                            THEN 1 
                            ELSE 0 
                        END
                    ) AS all_complete
                FROM 
                    evaluasi e
                JOIN 
                    jadwal j ON e.id_jadwal = j.id_jadwal
                JOIN 
                    kegiatan k ON j.id_kegiatan = k.id_kegiatan
                WHERE 
                    k.id_guru = $1
                GROUP BY 
                    j.tanggal
                ORDER BY 
                    j.tanggal ASC`;
    
                const { rows } = await postgre.query(query, [idGuru]);
                
                let consecutiveDays = 0;
                let isConsecutive = false;

                for (const row of rows) {
                    if (row.all_present) {
                        consecutiveDays++;
                        if (consecutiveDays === 7) {
                            isConsecutive = true;
                            break;
                        }
                    } else {
                        consecutiveDays = 0;
                    }
                }

                if (isConsecutive) {
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
                    j.tanggal,
                    COUNT(*) = SUM(
                        CASE 
                            WHEN e.catatan_kehadiran IS NOT NULL 
                                AND e.penilaian IS NOT NULL
                                AND e.catatan IS NOT NULL
                                AND e.feedback IS NOT NULL
                                AND e.id_karya IS NOT NULL 
                            THEN 1 
                            ELSE 0 
                        END
                    ) AS all_complete
                FROM 
                    evaluasi e
                JOIN 
                    jadwal j ON e.id_jadwal = j.id_jadwal
                JOIN 
                    kegiatan k ON j.id_kegiatan = k.id_kegiatan
                WHERE 
                    k.id_guru = $1
                GROUP BY 
                    j.tanggal
                ORDER BY 
                    j.tanggal ASC`;
    
                const { rows } = await postgre.query(query, [idGuru]);
                
                let consecutiveDays = 0;
                let isConsecutive = false;

                for (const row of rows) {
                    if (row.all_present) {
                        consecutiveDays++;
                        if (consecutiveDays === 30) {
                            isConsecutive = true;
                            break;
                        }
                    } else {
                        consecutiveDays = 0;
                    }
                }

                if (isConsecutive) {
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
    },
    checkBadgeKonsisten: async (req, res) => {
        try {
            const idGuru = req.params.id;

            const badgeCheckQuery = `
                SELECT *
                FROM badge_guru
                    LEFT JOIN badge on badge.id_badge = badge_guru.id_badge
                WHERE badge_guru.id_guru = $1 AND nama_badge = 'Konsisten' 
            `;

            const initialresult = await postgre.query(badgeCheckQuery, [idGuru]);
            
            if (initialresult.rows.length > 0) {
                const query = `
                SELECT 
                    j.tanggal,
                    COUNT(*) = SUM(CASE WHEN e.catatan_kehadiran IS NOT NULL THEN 1 ELSE 0 END) AS all_present
                FROM 
                    evaluasi e
                JOIN 
                    jadwal j ON e.id_jadwal = j.id_jadwal
                JOIN 
                    kegiatan k ON j.id_kegiatan = k.id_kegiatan
                WHERE 
                    k.id_guru = $1
                GROUP BY 
                    j.tanggal
                ORDER BY 
                    j.tanggal ASC`;
    
                const { rows } = await postgre.query(query, [idGuru]);
                
                let consecutiveDays = 0;
                let isConsecutive = false;

                for (const row of rows) {
                    if (row.all_present) {
                        consecutiveDays++;
                        if (consecutiveDays === 7) {
                            isConsecutive = true;
                            break;
                        }
                    } else {
                        consecutiveDays = 0;
                    }
                }

                if (isConsecutive) {
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
    checkBadgeAmbis: async (req, res) => {
        try {
            const idGuru = req.params.id;

            const badgeCheckQuery = `
                SELECT *
                FROM badge_guru
                    LEFT JOIN badge on badge.id_badge = badge_guru.id_badge
                WHERE badge_guru.id_guru = $1 AND nama_badge = 'Ambis' 
            `;

            const initialresult = await postgre.query(badgeCheckQuery, [idGuru]);
            
            if (initialresult.rows.length > 0) {
                const query = `
                SELECT 
                    j.tanggal,
                    COUNT(*) = SUM(CASE WHEN e.catatan_kehadiran IS NOT NULL THEN 1 ELSE 0 END) AS all_present
                FROM 
                    evaluasi e
                JOIN 
                    jadwal j ON e.id_jadwal = j.id_jadwal
                JOIN 
                    kegiatan k ON j.id_kegiatan = k.id_kegiatan
                WHERE 
                    k.id_guru = $1
                GROUP BY 
                    j.tanggal
                ORDER BY 
                    j.tanggal ASC`;
    
                const { rows } = await postgre.query(query, [idGuru]);
                
                let consecutiveDays = 0;
                let isConsecutive = false;

                for (const row of rows) {
                    if (row.all_present) {
                        consecutiveDays++;
                        if (consecutiveDays === 30) {
                            isConsecutive = true;
                            break;
                        }
                    } else {
                        consecutiveDays = 0;
                    }
                }

                if (isConsecutive) {
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
    }
}

export default profilController;