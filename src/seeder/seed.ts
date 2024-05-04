import postgre from '../database';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// #region constants
const TABLES = [
    'program', 'kompetensi', 'kelas', 'murid', 'guru','badge', 'topik', 
    'kegiatan', 'jadwal', 'program_kompetensi', 'badge_guru', 'murid_kelas', 
    'kelas_program', 'konten', 'karya', 'evaluasi', 'evaluasi_log'
];

const ENUM_NAMES = ['kehadiran_enum', 'action_enum'];

dotenv.config();
const BASE_URL = process.env.DEV_DEPLOY_URL || process.env.PROD_DEPLOY_URL || '';
// #endregion

// #region databases
const createDatabaseSchema = async () => {
    await postgre.query(`
    CREATE TABLE program (
    id_program SERIAL PRIMARY KEY,
    nama_program VARCHAR(255) NOT NULL,
    tujuan_pembelajaran TEXT,
    periode_belajar VARCHAR(255) NOT NULL,
    tahun_akademik VARCHAR(50) NOT NULL,
    path_banner VARCHAR(255)
);

CREATE TABLE kompetensi (
    id_kompetensi SERIAL PRIMARY KEY,
    judul_kompetensi VARCHAR(255) NOT NULL
);

CREATE TABLE kelas (
    id_kelas SERIAL PRIMARY KEY,
    nama_kelas VARCHAR(255) NOT NULL,
    jenjang VARCHAR(100) NOT NULL
);

CREATE TABLE guru (
    id_guru SERIAL PRIMARY KEY,
    nama_guru VARCHAR(255) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    path_foto_profil VARCHAR(255)
);

CREATE TABLE murid (
    id_murid SERIAL PRIMARY KEY,
    nama_murid VARCHAR(100) NOT NULL,
    jenis_kelamin CHAR(1) NOT NULL,
    tanggal_lahir DATE,
    nisn CHAR(10) NOT NULL,
    path_foto_profil VARCHAR(255)
);

CREATE TABLE badge (
    id_badge SERIAL PRIMARY KEY,
    nama_badge VARCHAR(255) NOT NULL,
    deskripsi TEXT NOT NULL,
    path_badge VARCHAR(255)
);

CREATE TABLE topik (
    id_topik SERIAL PRIMARY KEY,
    nama_topik VARCHAR(255) NOT NULL,
    id_program INTEGER REFERENCES program(id_program)
);

CREATE TABLE kegiatan (
    id_kegiatan SERIAL PRIMARY KEY,
    nama_kegiatan VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    id_topik INTEGER REFERENCES topik(id_topik) NOT NULL,
    id_guru INTEGER REFERENCES guru(id_guru) NOT NULL,
    instruksi_guru TEXT,
    instruksi_murid TEXT
);

CREATE TABLE jadwal (
    id_jadwal SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL,
    waktu TIME NOT NULL,
    lokasi VARCHAR(255),
    id_kegiatan INTEGER REFERENCES kegiatan(id_kegiatan) NOT NULL,
    id_kelas INTEGER REFERENCES kelas(id_kelas) NOT NULL
);

CREATE TABLE program_kompetensi (
    id_program INTEGER REFERENCES program(id_program) NOT NULL,
    id_kompetensi INTEGER REFERENCES kompetensi(id_kompetensi) NOT NULL,
    PRIMARY KEY (id_program, id_kompetensi)
);

CREATE TABLE badge_guru (
    id_badge INTEGER REFERENCES badge(id_badge) NOT NULL,
    id_guru INTEGER REFERENCES guru(id_guru) NOT NULL,
    PRIMARY KEY (id_badge, id_guru)
);

CREATE TABLE murid_kelas(
    id_murid INTEGER REFERENCES murid(id_murid) NOT NULL,
    id_kelas INTEGER REFERENCES kelas(id_kelas) NOT NULL,
    PRIMARY KEY (id_murid, id_kelas)
);

CREATE TABLE kelas_program (
    id_kelas INTEGER REFERENCES kelas(id_kelas) NOT NULL,
    id_program INTEGER REFERENCES program(id_program) NOT NULL,
    PRIMARY KEY (id_kelas, id_program)
);

CREATE TABLE konten (
    id_konten SERIAL PRIMARY KEY,
    nama_konten VARCHAR(255) NOT NULL,
    tipe_konten VARCHAR(50) NOT NULL,
    nama_file VARCHAR(255),
    tipe_file VARCHAR(50) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    id_kegiatan INTEGER REFERENCES kegiatan(id_kegiatan)
);

CREATE TABLE karya (
    id_karya SERIAL PRIMARY KEY,
    nama_karya VARCHAR(255) NOT NULL,
    id_murid INTEGER REFERENCES murid(id_murid),
    tipe_file VARCHAR(5) NOT NULL,
    file_path VARCHAR(255) NOT NULL
);

CREATE TYPE kehadiran_enum AS ENUM ('Hadir', 'Izin', 'Sakit', 'Alpa');

CREATE TABLE evaluasi (
    id_jadwal INTEGER REFERENCES jadwal(id_jadwal) NOT NULL,
    id_murid INTEGER REFERENCES murid(id_murid) NOT NULL,
    catatan_kehadiran kehadiran_enum,
    penilaian INTEGER,
    catatan TEXT,
    feedback TEXT,
    id_karya INTEGER REFERENCES karya(id_karya),
    PRIMARY KEY (id_jadwal, id_murid)
);

CREATE TYPE action_enum AS ENUM ('Create', 'Update', 'Delete');

CREATE TABLE evaluasi_log(
    id_log SERIAL PRIMARY KEY,
    id_murid INTEGER REFERENCES murid(id_murid),
    id_jadwal INTEGER REFERENCES jadwal(id_jadwal),
    timestamp TIMESTAMP,
    editor INTEGER REFERENCES guru(id_guru),
    action action_enum,
    field VARCHAR(255),
    old_value TEXT
);
    `);
    console.log('Schema created!');
}

const dropDatabase = async () => {
    for (let i = 0; i < TABLES.length; i++){
        await postgre.query(`DROP TABLE IF EXISTS ${TABLES[i]} CASCADE`);
    }
    for (let i = 0; i < ENUM_NAMES.length; i++){
        await postgre.query(`DROP TYPE IF EXISTS ${ENUM_NAMES[i]} CASCADE`);
    }
}
// #endregion

// #region seeding
const PDFS_DIR_PATH = path.join(__dirname, '../../contents/pdfs');
const IMAGES = path.join(__dirname, '../../contents/images/');
const UPLOADS_DIR_PATH = path.join(__dirname, '../../uploads');

function getAllFilePaths(directory : string, folderPath : string = '.', fileList : string[] = []) : string[] {
    const files = fs.readdirSync(path.join(directory, folderPath));

    files.forEach((file) => {
        const filePath = path.join(directory, folderPath, file);
        const stat = fs.lstatSync(filePath);

        if (stat.isDirectory()){
            fileList = getAllFilePaths(directory, path.join(folderPath, file), fileList);
        } else {
            fileList.push(path.join(folderPath, file).replace(/\\/g, '/'));
        }
    });

    return fileList;
}

let PDFS_PATHS = getAllFilePaths(PDFS_DIR_PATH); // stores pdfs,
PDFS_PATHS = PDFS_PATHS.map((path) => {
    return `${BASE_URL}/static/pdf/${path}`;
});

let EMOJI_PATHS = getAllFilePaths(IMAGES, 'emojis');
EMOJI_PATHS = EMOJI_PATHS.map((path) => {
    return `${BASE_URL}/static/image/${path}`;
});

const UPLOAD_PATHS = getAllFilePaths(UPLOADS_DIR_PATH); // stores hasil karya

const TED_TALKS_LINKS = [
    "https://www.youtube.com/embed/LUn8IjZKBPg",
    "https://www.youtube.com/embed/arj7oStGLkU",
    "https://www.youtube.com/embed/eIho2S0ZahI",
    "https://www.youtube.com/embed/6Af6b_wyiwI",
    "https://www.youtube.com/embed/DFjIi2hxxf0",
    "https://www.youtube.com/embed/KM4Xe6Dlp0Y",
    "https://www.youtube.com/embed/GZGY0wPAnus",
    "https://www.youtube.com/embed/zIwLWfaAg-8",
    "https://www.youtube.com/embed/8KkKuTCFvzI",
    "https://www.youtube.com/embed/Ks-_Mh1QhMc",
    "https://www.youtube.com/embed/xYemnKEKx0c",
    "https://www.youtube.com/embed/P_6vDLq64gE",
    "https://www.youtube.com/embed/iG9CE55wbtY",
    "https://www.youtube.com/embed/iCvmsMzlF7o",
    "https://www.youtube.com/embed/PdxPCeWw75k",
    "https://www.youtube.com/embed/qp0HIF3SfI4",
    "https://www.youtube.com/embed/c0KYU2j0TM4",
    "https://www.youtube.com/embed/5MuIMqhT8DM"
]

const getRandomFromList = (list : any[]) => {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
}

const getRandomTedTalkEmbedLink = () => { // To generate random embed contents
    return getRandomFromList(TED_TALKS_LINKS);
}

const predictProgramMapToPdf = (program : string) => {
    if (program.includes('Pendidikan Pancasila')){
        return 'Pendidikan_Pancasila';
    } else if (program.includes('Bahasa Inggris')){
        return 'Bahasa_Inggris';
    } else if (program.includes('Matematika')){
        return 'Matematika';
    } else if (program.includes('Bahasa Indonesia')){
        return 'Bahasa_Indonesia';
    }
}

const getJenjangFromProgram = (program : string) => {
    return program.slice(program.length - 4, program.length);
}

const getPdfFor = (program : string, jenjang : string | undefined = undefined) => {
    jenjang = jenjang || getJenjangFromProgram(program);

    const mapJenjangToKelas : {[key: string]: string} = {
        '1 SD': 'Kelas_I',
        '2 SD': 'Kelas_II',
        '3 SD': 'Kelas_III',
        '4 SD': 'Kelas_IV',
        '5 SD': 'Kelas_V',
        '6 SD': 'Kelas_VI',
    }

    const pdfProgram = predictProgramMapToPdf(program);
    const pdfKelas = mapJenjangToKelas[jenjang];

    const pdfPath = `${BASE_URL}/static/pdf/Buku_${pdfProgram}_${pdfKelas}.pdf`;
    if (!PDFS_PATHS.includes(pdfPath)){
        return getRandomFromList(PDFS_PATHS);
    }

    return pdfPath;
}

const getRandomPfp = () => {
    return getRandomFromList(EMOJI_PATHS);
}

const PROGRAMS = [
// Mengenal dan menceritakan simbol dan sila-sila Pancasila dalam lambang negara
// Garuda Pancasila; mengidentifikasi dan menjelaskan hubungan antara simbol dan
// sila dalam lambang negara Garuda Pancasila; menerapkan nilai-nilai Pancasila di
// lingkungan keluarga dan sekolah; mengenal aturan di lingkungan keluarga dan
// sekola; menceritakan contoh sikap mematuhi dan tidak mematuhi aturan di keluarga
// dan sekolah; menunjukkan perilaku mematuhi aturan di keluarga dan sekolah.
// Menyebutkan identitas dirinya sesuai dengan jenis kelamin, ciri-ciri fisik, dan
// hobinya; menyebutkan identitas diri (fisik dan non fisik) keluarga dan teman-
// temannya di lingkungan rumah dan di sekolah; menceritakan dan menghargai
// perbedaan baik fisik (contoh : warna kulit, jenis rambut, dll) maupun nonfisik
// (contoh: miskin, kaya, dll) keluarga dan teman-temannya di lingkungan rumah dan
// sekolah.
// Capaian Pembelajaran Mata Pelajaran Pendidikan Pancasila Fase A - Fase F untuk SD/MI/Program Paket A,
// SMP/MTs/Program Paket B, dan SMA/MA/SMK/MAK/Program Paket C12
// Mengidentifikasi dan menceritakan bentuk kerja sama dalam keberagaman di
// lingkungan keluarga dan sekolah; mengenal ciri-ciri fisik lingkungan keluarga dan
// sekolah, sebagai bagian tidak terpisahkan dari wilayah NKRI; dan menyebutkan
// contoh sikap dan perilaku menjaga lingkungan sekitar serta mempraktikkannya di
// lingkungan keluarga dan sekolah.
    {
        id_program: 1,
        nama_program: 'Pendidikan Pancasila Kelas 1 SD',
        tujuan_pembelajaran: `Mengenal dan menceritakan simbol dan sila-sila Pancasila
Menyebutkan identitas diri, keluaraga, dan teman-temannya
Mengidentikasi dan menceritakan bentuk kerjasama dalam keberagaman`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/pancasila.png`,
        topik : [
            {
                id_topik: 1,
                nama_topik: 'Aku dan Teman-Temanku',
                kegiatan: [
                    {
                        id_kegiatan: 1,
                        nama_kegiatan: '[Tatap Muka] Perkenalan Aku dan Teman-Temanku',
                        deskripsi: 'Memperkenalkan diri dan teman-teman',
                        instruksi_guru: 'Bacakan buku halaman 1',
                        instruksi_murid: 'Bacalah buku halaman 1\nBerkenalan dengan teman sebangku',
                    },
                    {
                        id_kegiatan: 2,
                        nama_kegiatan: '[Tatap Muka] Menyanyikan Lagu Teman-Temanku',
                        deskripsi: 'Menyanyikan lagu teman-teman',
                        instruksi_guru: 'Bacakan buku halaman 12',
                        instruksi_murid: 'Baca buku halaman 12\nMenyanyikan lagu teman-teman',
                    }
                ]
            },
            {
                id_topik: 2,
                nama_topik: 'Aku Patuh pada Aturan',
                kegiatan: [
                    {
                        id_kegiatan: 3,
                        nama_kegiatan: '[Tatap Muka] Memahami Aturan Sekolah',
                        deskripsi: 'Memahami aturan sekolah',
                        instruksi_guru: 'Bacakan buku halaman 20',
                        instruksi_murid: 'Baca buku halaman 20\nMenyimak aturan sekolah',
                    },
                    {
                        id_kegiatan: 4,
                        nama_kegiatan: '[Tatap Muka] Bermain Bersama',
                        deskripsi: 'Bermain bersama dengan teman-teman',
                        instruksi_guru: 'Bacakan buku halaman 25',
                        instruksi_murid: 'Baca buku halaman 25\nBermain bersama dengan teman-teman',
                    }
                ]
            },
            {
                id_topik: 3,
                nama_topik: 'Aku Mengenal Indonesia',
                kegiatan: [
                    {
                        id_kegiatan: 5,
                        nama_kegiatan: '[Tatap Muka] Mengenal Bendera Indonesia',
                        deskripsi: 'Mengenal bendera Indonesia',
                        instruksi_guru: 'Bacakan buku halaman 30',
                        instruksi_murid: 'Baca buku halaman 30\nMenggambar bendera Indonesia',
                    },
                    {
                        id_kegiatan: 6,
                        nama_kegiatan: '[Tatap Muka] Mengenal Lagu Kebangsaan',
                        deskripsi: 'Mengenal lagu kebangsaan Indonesia Raya',
                        instruksi_guru: 'Bacakan buku halaman 35',
                        instruksi_murid: 'Baca buku halaman 35\nMenyanyikan lagu Indonesia Raya',
                    },
                ]
            },
            {
                id_topik: 4,
                nama_topik: 'Aku dan Lingkuganku',
                kegiatan: [
                    {
                        id_kegiatan: 7,
                        nama_kegiatan: '[Tugas] Membuat Poster Gotong Royong',
                        deskripsi: 'Membuat poster gotong royong',
                        instruksi_guru: 'Bacakan buku halaman 40',
                        instruksi_murid: 'Baca buku halaman 40\nMembuat poster gotong royong',
                    },
                    {
                        id_kegiatan: 8,
                        nama_kegiatan: '[Tatap Muka] Bermain Bersama',
                        deskripsi: 'Bermain bersama dengan teman-teman',
                        instruksi_guru: 'Bacakan buku halaman 45',
                        instruksi_murid: 'Baca buku halaman 45\nBermain bersama dengan teman-teman',
                    },
                ]
            }
        ]
    },

// Memahami dan menjelaskan makna sila-sila Pancasila serta menceritakan contoh
// penerapan sila Pancasila dalam kehidupan sehari-hari; menerapkan nilai-nilai
// Pancasila di lingkungan keluarga, sekolah, dan masyarakat; mengidentifikasi aturan
// di keluarga, sekolah, dan lingkungan sekitar tempat tinggal serta melaksanakannya
// dengan bimbingan orang tua dan guru; mengidentifikasi dan menyajikan hasil
// identifikasi hak dan kewajiban sebagai anggota keluarga dan sebagai warga
// sekolah; dan melaksanakan kewajiban dan hak sebagai anggota keluarga dan
// sebagai warga sekolah.
// Menjelaskan identitas diri, keluarga, dan teman-temannya sesuai budaya, minat,
// dan perilakunya; mengenali dan menyebutkan identitas diri (fisik dan non-fisik)
// orang di lingkungan sekitarnya; menghargai perbedaan karakteristik baik fisik
// (contoh : warna kulit, jenis rambut, dll) maupun non fisik (contoh : miskin, kaya, dll)
// orang di lingkungan sekitar; menghargai kebinekaan suku bangsa, sosial budaya,
// dalam bingkai Bhinneka Tunggal Ika; mengidentifikasi dan menyajikan berbagai
// bentuk keberagaman suku bangsa, sosial budaya di lingkungan sekitar; memahami
// lingkungan sekitar (RT/RW/desa/kelurahan, dan kecamatan) sebagai bagian tidak
// terpisahkan dari wilayah NKRI; dan menampilkan sikap kerja sama dalam berbagai
// bentuk keberagaman suku bangsa, sosial, dan budaya di Indonesia yang terikat
// persatuan dan kesatuan.
    {
        id_program: 2,
        nama_program: 'Pendidikan Pancasila Kelas 2 SD',
        tujuan_pembelajaran: `Memahami dan menjelasakan simbol dan sila-sila Pancasila
Menjelaskan identitas diri, keluaraga, dan teman-temannya sesuai budaya dan minat`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/pancasila.png`,
        topik : [
            {
                id_topik: 5, 
                nama_topik: 'Pancasila dan Simbolnya',
                kegiatan: [
                    {
                        id_kegiatan: 9,
                        nama_kegiatan: '[Tata Muka] Mengenal Pancasila',
                        deskripsi: 'Mengenal Pancasila dan simbolnya',
                        instruksi_guru: 'Bacakan buku halaman 1',
                        instruksi_murid: '- Bacalah buku halaman 1\n',
                    },
                    {
                        id_kegiatan: 10,
                        nama_kegiatan: '[Tatap Muka] Menghafal Sila-sila Pancasila',
                        deskripsi: 'Menghafal sila-sila Pancasila',
                        instruksi_guru: '- Bacakan buku halaman 5',
                        instruksi_murid: '- Baca buku halaman 5\n- Menghafal sila-sila Pancasila',
                    }
                ]
            },
            {
                id_topik: 6,
                nama_topik: 'Identitas Diri dan Keluarga',
                kegiatan: [
                    {
                        id_kegiatan: 11,
                        nama_kegiatan: '[Tatap Muka] Menceritakan Keluarga',
                        deskripsi: 'Menceritakan keluarga',
                        instruksi_guru: '- Bacakan buku halaman 10',
                        instruksi_murid: '- Baca buku halaman 10\n- Menceritakan keluarga sendiri',
                    },
                    {
                        id_kegiatan: 12,
                        nama_kegiatan: '[Tatap Muka] Menceritakan Teman-teman',
                        deskripsi: 'Menceritakan teman-teman',
                        instruksi_guru: '- Bacakan buku halaman 15',
                        instruksi_murid: '- Baca buku halaman 15\n- Menceritakan teman-teman',
                    }
                ]
            },
            {
                id_topik: 7,
                nama_topik: 'Kerjasama dalam Keberagaman',
                kegiatan: [
                    {
                        id_kegiatan: 13,
                        nama_kegiatan: '[Tugas] Membuat Essay tentang Kerjasama',
                        deskripsi: 'Membuat essay tentang kerjasama',
                        instruksi_guru: '- Bacakan buku halaman 20',
                        instruksi_murid: '- Baca buku halaman 20\n- Membuat essay tentang kerjasama',
                    },
                    {
                        id_kegiatan: 14,
                        nama_kegiatan: '[Tatap Muka] Bermain Bersama',
                        deskripsi: 'Bermain bersama dengan teman-teman',
                        instruksi_guru: '- Bacakan buku halaman 25',
                        instruksi_murid: '- Baca buku halaman 25\n- Bermain bersama dengan teman-teman',
                    }
                ]
            }
        ]
    },
// Memahami dan menyajikan hubungan antarsila dalam Pancasila sebagai suatu
// kesatuan yang utuh; mengidentifikasi dan menyajikan makna nilai-nilai Pancasila
// sebagai pandangan hidup berbangsa dan bernegara; menerapkan nilai-nilai
// Pancasila di lingkungan keluarga, sekolah, dan masyarakat; menganalisis dan
// menyajikan hasil analisis bentuk-bentuk sederhana norma, aturan, hak, dan
// kewajiban dalam kedudukannya sebagai anggota keluarga, warga sekolah, dan
// Capaian Pembelajaran Mata Pelajaran Pendidikan Pancasila Fase A - Fase F untuk SD/MI/Program Paket A,
// SMP/MTs/Program Paket B, dan SMA/MA/SMK/MAK/Program Paket C13
// bagian dari masyarakat; menganalisis secara sederhana dan menyajikan hasil
// analisis pelaksanaan norma, aturan, hak, dan kewajiban sebagai anggota keluarga,
// dan warga sekolah; melaksanakan kewajiban dan hak sebagai anggota keluarga,
// warga sekolah, dan bagian dari masyarakat; dan mempraktikkan membuat
// kesepakatan dan aturan bersama serta menaatinya dalam kehidupan sehari-hari di
// keluarga dan di sekolah.
// Menganalisis, menyajikan hasil analisis, menghormati, menjaga, dan melestarikan
// keragaman budaya dalam bingkai Bhinneka Tunggal Ika di lingkungan sekitarnya;
// mengenal wilayahnya dalam konteks kabupaten/kota, provinsi sebagai bagian yang
// tidak terpisahkan dari wilayah NKRI; dan membangun kebersamaan, persatuan, dan
// berkontribusi menciptakan kenyamanan di sekolah dan lingkungan sekitar.
    {
        id_program: 3,
        nama_program: 'Pendidikan Pancasila Kelas 3 SD',
        tujuan_pembelajaran: `Memahami dan menyajikan hubungan antarsila sebagai satu kesatuan
Menganalisis, menghormati, menjaga, dan melestari keberagaman budaya`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/pancasila.png`,
        topik : [
            {
                id_topik: 8,
                nama_topik: 'Pancasila dan Hubungan Antarsila',
                kegiatan: [
                    {
                        id_kegiatan: 15,
                        nama_kegiatan: '[Tatap Muka] Mengenal Pancasila',
                        deskripsi: 'Mengenal Pancasila dan hubungan antarsila',
                        instruksi_guru: 'Bacakan buku halaman 1',
                        instruksi_murid: 'Bacalah buku halaman 1\nTes pengetahuan tentang Pancasila dan hubungan antarsila',
                    },
                    {
                        id_kegiatan: 16,
                        nama_kegiatan: '[Tatap Muka] Studi Kasus Hubungan Antarsila',
                        deskripsi: 'Studi kasus hubungan antarsila',
                        instruksi_guru: 'Bacakan buku halaman 9',
                        instruksi_murid: 'Baca buku halaman 9\nMengerjakan studi kasus hubungan antarsila',
                    }
                ]
            },
            {
                id_topik: 9,
                nama_topik: 'Keragaman Budaya',
                kegiatan: [
                    {
                        id_kegiatan: 17,
                        nama_kegiatan: '[Tatap Muka] Memahami Budaya Indonesia',
                        deskripsi: 'Memahami budaya Indonesia',
                        instruksi_guru: 'Bacakan buku halaman 12',
                        instruksi_murid: 'Baca buku halaman 12\nTanya jawab tentang budaya Indonesia',
                    },
                    {
                        id_kegiatan: 18,
                        nama_kegiatan: '[Tatap Muka] Menceritakan Budaya Daerah Sendiri',
                        deskripsi: 'Menceritakan budaya daerah',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Baca buku halaman 15\nMenceritakan budaya daerah',
                    }
                ]
            },
            {
                id_topik: 10,
                nama_topik: 'Kerjasama dalam Keberagaman',
                kegiatan: [
                    {
                        id_kegiatan: 19,
                        nama_kegiatan: '[Tugas] Video Kerjasama dalam Keberagaman',
                        deskripsi: 'Membuat video tentang kerjasama dalam keberagaman',
                        instruksi_guru: 'Bacakan buku halaman 20',
                        instruksi_murid: 'Baca buku halaman 20\nMembuat video kerjasama dalam keberagaman',
                    }
                ]
            }
        ]
    },
// Menganalisis kronologis lahirnya Pancasila; mengkaji fungsi dan kedudukan
// Pancasila sebagai dasar negara dan pandangan hidup bangsa, serta mengenal
// Pancasila sebagai ideologi negara; memahami implementasi Pancasila dalam
// kehidupan bernegara dari masa ke masa; mengidentifikasi hubungan Pancasila
// dengan Undang-Undang Dasar Negara Republik Indonesia Tahun 1945, Bhinneka
// Tunggal Ika, dan Negara Kesatuan Republik Indonesia; serta melaksanakan nilai-
// nilai Pancasila dalam kehidupan sehari-hari; dan mengidentifikasi kontribusi
// Pancasila sebagai pandangan hidup dalam menyelesaikan persoalan lokal dan
// global dengan menggunakan sudut pandang Pancasila.
// Memahami periodisasi pemberlakuan dan perubahan Undang-Undang Dasar
// Negara Republik Indonesia Tahun 1945; memahami Undang-Undang Dasar Negara
// Republik Indonesia Tahun 1945 sebagai sumber hukum tertinggi; memahami bentuk
// pemerintahan yang berlaku dalam kerangka Negara Kesatuan Republik Indonesia;
// memahami peraturan perundang-undangan dan tata urutannya; dan mematuhi
// pentingnya norma dan aturan, menyeimbangkan hak dan kewajiban warga negara.
// Mengidentifikasi keberagaman suku, agama, ras dan antargolongan dalam
// bingkai Bhinneka Tunggal Ika, dan mampu menerima keragaman dan perubahan
// budaya sebagai suatu kenyataan yang ada di dalam kehidupan bermasyarakat,
// dan menanggapi secara proporsional terhadap kondisi yang ada di lingkungan
// Capaian Pembelajaran Mata Pelajaran Pendidikan Pancasila Fase A Fase F untuk SD/MI/Program Paket A,
// SMP/MTs/Program Paket B, dan SMA/MA/SMK/MAK/Program Paket C14
// sesuai dengan peran dan kebutuhan yang ada di masyarakat; memahami urgensi
// pelestarian nilai tradisi, kearifan lokal dan budaya; menunjukkan contoh pelestarian
// nilai tradisi, kearifan lokal dan budaya; dan menumbuhkan sikap tanggung jawab
// dan berperan aktif dalam menjaga dan melestarikan praktik nilai tradisi, kearifan
// lokal dan budaya dalam masyarakat global.
// Mengidentifikasi wilayah Negara Kesatuan Republik Indonesia sebagai satu
// kesatuan utuh dan wawasan nusantara dalam konteks Negara Kesatuan Republik
// Indonesia; menjaga keutuhan wilayah NKRI; menunjukkan perwujudan demokrasi
// yang didasari oleh nilai-nilai Pancasila serta menunjukkan contoh serta praktik
// kemerdekaan berpendapat warga negara dalam era keterbukaan informasi;
// mengidentifikasi sistem pemerintahan Indonesia, kedudukan, tugas, wewenang,
// dan hubungan antarlembaga-lembaga negara, hubungan negara dengan warga
// negara baik di bidang politik, ekonomi, sosial, dan budaya maupun pertahanan dan
// keamanan; dan menyusun laporan singkat tentang sistem pemerintahan Indonesia,
// kedudukan, tugas, wewenang, dan hubungan antarlembaga-lembaga negara,
// hubungan negara dengan warga negara.
    {
        id_program: 4,
        nama_program: 'Pendidikan Pancasila Kelas 4 SD',
        tujuan_pembelajaran: `Menganalisis kronologis lahirnya Pancasila
Memahami periodisasi pemberlakuan dan perubahan Undang-Undang Dasar 1945
Mengidentifikasi keberagaman suku, agama, ras, dan antargolongan dalam bingkai Bhinneka Tunggal Ika`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/pancasila.png`,
        topik : [
            {
                id_topik: 11,
                nama_topik: 'Lahirnya Pancasila',
                kegiatan: [
                    {
                        id_kegiatan: 20,
                        nama_kegiatan: '[Tatap Muka] Mengenal Sejarah Pancasila (Part 1)',
                        deskripsi: 'Mengenal sejarah lahirnya Pancasila',
                        instruksi_guru: 'Bacakan buku halaman 7',
                        instruksi_murid: 'Bacalah buku halaman 7',
                    },
                    {
                        id_kegiatan: 21,
                        nama_kegiatan: '[Tatap Muka] Mengenal Sejarah Pancasila (Part 2)',
                        deskripsi: 'Mengenal sejarah lahirnya Pancasila',
                        instruksi_guru: 'Bacakan buku halaman 9',
                        instruksi_murid: 'Baca buku halaman 9',
                    }
                ]
            },
            {
                id_topik: 12,
                nama_topik: 'Undang-Undang Dasar 1945',
                kegiatan: [
                    {
                        id_kegiatan: 22,
                        nama_kegiatan: '[Tatap Muka] Menceritakan UUD 1945',
                        deskripsi: 'Menceritakan UUD 1945',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Baca buku halaman 10\nMenceritakan UUD 1945',
                    },
                    {
                        id_kegiatan: 23,
                        nama_kegiatan: '[Tatap Muka] Perubahan UUD 1945',
                        deskripsi: 'Perubahan UUD 1945',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Baca buku halaman 15\nMenceritakan perubahan UUD 1945',
                    }
                ]
            },
            {
                id_topik: 13,
                nama_topik: 'Bhinneka Tunggal Ika',
                kegiatan: [
                    {
                        id_kegiatan: 24,
                        nama_kegiatan: '[Asesmen] Ujian Bhinneka Tunggal Ika',
                        deskripsi: 'Mengasah pengetahuan tentang Bhinneka Tunggal Ika',
                        instruksi_guru: 'Bacakan buku halaman 20',
                        instruksi_murid: 'Baca buku halaman 20\nMengerjakan soal Bhinneka Tunggal Ika',
                    },
                    {
                        id_kegiatan: 25,
                        nama_kegiatan: '[Tatap Muka] Bermain Bersama',
                        deskripsi: 'Bermain bersama dengan teman-teman',
                        instruksi_guru: 'Bacakan buku halaman 25',
                        instruksi_murid: 'Baca buku halaman 25\nBermain bersama dengan teman-teman',
                    }
                ]
            }
        ]
    },
// Menganalisis cara pandang para pendiri negara tentang rumusan Pancasila sebagai
// dasar negara; menganalisis fungsi dan kedudukan Pancasila sebagai dasar negara,
// ideologi negara, dan identitas nasional; mengenali dan menggunakan produk dalam
// negeri sekaligus mempromosikan budaya lokal dan nasional; menganalisis hak dan
// kewajiban warga negara yang diatur dalam Undang-Undang Dasar Negara Republik
// Indonesia Tahun 1945; peserta didik mendemonstrasikan praktik kemerdekaan
// berpendapat warga negara dalam era keterbukaan informasi sesuai dengan
// nilai-nilai Pancasila; dan menganalisis kasus pelanggaran hak dan pengingkaran
// kewajiban sebagaimana diatur dalam Undang-Undang Dasar Negara Republik
// Indonesia Tahun 1945 dan perumusan solusi secara kreatif, kritis, dan inovatif untuk
// memecahkan kasus pelanggaran hak dan pengingkaran kewajiban.
// Peserta didik mampu menginisiasi kegiatan bersama atau gotong royong dalam
// praktik hidup sehari-hari untuk membangun masyarakat sekitar dan masyarakat
// Capaian Pembelajaran Mata Pelajaran Pendidikan Pancasila Fase A Fase F untuk SD/MI/Program Paket A,
// SMP/MTs/Program Paket B, dan SMA/MA/SMK/MAK/Program Paket C15
// Indonesia berdasarkan nilai-nilai Pancasila; memberi contoh dan memiliki kesadaran
// akan hak dan kewajibannya sebagai warga sekolah, warga masyarakat dan warga
// negara; dan memahami peran dan kedudukannya sebagai warga negara Indonesia
    {
        id_program: 5,
        nama_program: 'Pendidikan Pancasila Kelas 5 SD',
        tujuan_pembelajaran: `Menganalisis cara pandang perumus Pancasila
Mampu menginisiasi kegiatan bersama atau gotong royong`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/pancasila.png`,
        topik : [
            {
                id_topik: 14,
                nama_topik: 'Pandangan Perumus Pancasila',
                kegiatan: [
                    {
                        id_kegiatan: 26,
                        nama_kegiatan: '[Tatap Muka] Mengenal Perumus Pancasila',
                        deskripsi: 'Mengenal perumus Pancasila',
                        instruksi_guru: 'Bacakan buku halaman 1',
                        instruksi_murid: 'Bacalah buku halaman 1'
                    },
                    {
                        id_kegiatan: 27,
                        nama_kegiatan: '[Tatap Muka] Memahami Pandangan Perumus Pancasila',
                        deskripsi: 'Memahami pandangan perumus Pancasila',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Baca buku halaman 5',
                        
                    }
                ]
            },
            {
                id_topik: 15,
                nama_topik: 'Gotong Royong',
                kegiatan: [
                    {
                        id_kegiatan: 28,
                        nama_kegiatan: '[Tatap Muka] Menceritakan Gotong Royong',
                        deskripsi: 'Menceritakan gotong royong',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Baca buku halaman 10',
                    },
                    {
                        id_kegiatan: 29,
                        nama_kegiatan: '[Tatap Muka] Bermain Bersama',
                        deskripsi: 'Bermain bersama dengan teman-teman',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Baca buku halaman 15\nBermain bersama dengan teman-teman',
                    }
                ]
            }
        ]
    },
// Menganalisis kedudukan Pancasila sebagai ideologi terbuka; serta peluang dan
// tantangan penerapan nilai-nilai Pancasila dalam kehidupan global; menerapkan
// nilai-nilai Pancasila dalam kehidupan sehari-hari; menganalisis produk perundang-
// undangan dan mengevaluasi ketidaksesuaian antarproduk perundang-undangan;
// dan mempraktikkan sikap dan perilaku dalam menjaga keutuhan Negara Kesatuan
// Republik Indonesia.
// Peserta didik mampu menganalisis potensi konflik dan memberi solusi di tengah
// keragaman dalam masyarakat; berperan aktif mempromosikan Bhinneka Tunggal
// Ika; menganalisis dan memberi solusi terkait ancaman, tantangan, hambatan, dan
// gangguan (ATHG) yang dihadapi Indonesia; dan memahami sistem pertahanan dan
// keamanan negara; kemudian peserta didik mampu menganalisis peran Indonesia
// dalam hubungan antar bangsa dan negara.
    {
        id_program: 6,
        nama_program: 'Pendidikan Pancasila Kelas 6 SD',
        tujuan_pembelajaran: `Menganalisis kedudukan Pancasila sebagai ideologi terbuka
Menganalisis potensi konflik dan solusi di tengah keberagaman`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/pancasila.png`,
        topik : [
            {
                id_topik: 16,
                nama_topik: 'Pancasila sebagai Ideologi Terbuka',
                kegiatan: [
                    {
                        id_kegiatan: 30,
                        nama_kegiatan: '[Tatap Muka] Mengenal Pancasila sebagai Ideologi Terbuka',
                        deskripsi: 'Mengenal Pancasila sebagai ideologi terbuka',
                        instruksi_guru: 'Bacakan buku halaman 25',
                        instruksi_murid: 'Bacalah buku halaman 25'
                    },
                    {
                        id_kegiatan: 31,
                        nama_kegiatan: '[Tatap Muka] Membahas Potensi Konflik',
                        deskripsi: 'Membahas potensi konflik',
                        instruksi_guru: 'Bacakan buku halaman 35',
                        instruksi_murid: 'Baca buku halaman 35'
                    }
                ]
            },
            {
                id_topik: 17,
                nama_topik: 'Solusi Konflik',
                kegiatan: [
                    {
                        id_kegiatan: 32,
                        nama_kegiatan: '[Tatap Muka] Mencari Solusi Konflik',
                        deskripsi: 'Mencari solusi konflik',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Baca buku halaman 10',
                    },
                    {
                        id_kegiatan: 33,
                        nama_kegiatan: '[Tatap Muka] Bermain Bersama',
                        deskripsi: 'Bermain bersama dengan teman-teman',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Baca buku halaman 15\nBermain bersama dengan teman-teman',
                    }
                ]
            }
        ]
    },
// Peserta didik memiliki kemampuan berbahasa untuk berkomunikasi dan bernalar,
// sesuai dengan tujuan, kepada teman sebaya dan orang dewasa di sekitar tentang
// diri dan lingkungannya. Peserta didik menunjukkan minat serta mampu memahami
// dan menyampaikan pesan; mengekspresikan perasaan dan gagasan; berpartisipasi
// dalam percakapan dan diskusi sederhana dalam interaksi antarpribadi serta di
// depan banyak pendengar secara santun. Peserta didik mampu meningkatkan
// penguasaan kosakata baru melalui berbagai kegiatan berbahasa dan bersastra
// dengan topik yang beragam. Peserta didik juga mulai mampu mengungkapkan
// gagasannya secara lisan dan tulisan dengan sikap yang baik menggunakan kata-
// kata yang dikenalinya sehari-hari.
    {
        id_program: 7,
        nama_program: 'Bahasa Indonesia Kelas 1 SD',
        tujuan_pembelajaran: `Mampu berkomunikasi dan bernalar
Mampu meningkatkan penguasaan kosakata baru`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/bahasa-indonesia.png`,
        topik : [
            {
                id_topik: 18,
                nama_topik: 'Kosakata Dasar',
                kegiatan: [
                    {
                        id_kegiatan: 34,
                        nama_kegiatan: '[Tatap Muka] Mengenal Kosakata Dasar (Part 1)',
                        deskripsi: 'Mengenal kosakata dasar (Part 1)',
                        instruksi_guru: 'Bacakan buku halaman 3',
                        instruksi_murid: 'Bacalah buku halaman 3'
                    },
                    {
                        id_kegiatan: 35,
                        nama_kegiatan: '[Tatap Muka] Mengenal Kosakata Dasar (Part 2)',
                        deskripsi: 'Mengenal huruf I',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Bacalah buku halaman 5'
                    }
                ]
            },
            {
                id_topik: 19,
                nama_topik: 'Kosakata Sehari-hari',
                kegiatan: [
                    {
                        id_kegiatan: 36,
                        nama_kegiatan: '[Tatap Muka] Mengenal Buah-buahan',
                        deskripsi: 'Mengenal buah-buahan',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Bacalah buku halaman 10',
                    },
                    {
                        id_kegiatan: 37,
                        nama_kegiatan: '[Tatap Muka] Mengenal Hewan',
                        deskripsi: 'Mengenal hewan',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Bacalah buku halaman 15',
                    }
                ]
            }
        ]
    },
// Peserta didik memiliki kemampuan berbahasa untuk berkomunikasi dan bernalar,
// sesuai dengan tujuan, kepada teman sebaya dan orang dewasa tentang hal-hal
// menarik di lingkungan sekitarnya. Peserta didik menunjukkan minat terhadap teks,
// mampu memahami dan menyampaikan gagasan dari teks informatif, serta mampu
// mengungkapkan gagasan dalam kerja kelompok dan diskusi, serta memaparkan
// pendapatnya secara lisan dan tertulis. Peserta didik mampu meningkatkan
// penguasaan kosakata baru melalui berbagai kegiatan berbahasa dan bersastra
// dengan topik yang beragam. Peserta didik mampu membaca dengan fasih dan
// lancar.
    {
        id_program: 8,
        nama_program: 'Bahasa Indonesia Kelas 2 SD',
        tujuan_pembelajaran: `Mampu berkomunikasi dan bernalar
Mampu membaca dengan fasih dan lancar`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/bahasa-indonesia.png`,
        topik : [
            {
                id_topik: 20,
                nama_topik: 'Membaca Cepat',
                kegiatan: [
                    {
                        id_kegiatan: 38,
                        nama_kegiatan: '[Tatap Muka] Membaca Cepat (Part 1)',
                        deskripsi: 'Membaca cepat (Part 1)',
                        instruksi_guru: 'Bacakan buku halaman 3',
                        instruksi_murid: 'Bacalah buku halaman 3'
                    },
                    {
                        id_kegiatan: 39,
                        nama_kegiatan: '[Tatap Muka] Membaca Cepat (Part 2)',
                        deskripsi: 'Membaca cepat (Part 2)',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Bacalah buku halaman 5'
                    }
                ]
            },
            {
                id_topik: 21,
                nama_topik: 'Membaca Buku Cerita',
                kegiatan: [
                    {
                        id_kegiatan: 40,
                        nama_kegiatan: '[Tatap Muka] Membaca Buku Cerita',
                        deskripsi: 'Membaca buku cerita',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Bacalah buku halaman 10',
                    },
                    {
                        id_kegiatan: 41,
                        nama_kegiatan: '[Tatap Muka] Membaca Buku Pelajaran',
                        deskripsi: 'Membaca buku pelajaran',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Bacalah buku halaman 15',
                    }
                ]
            }
        ]
    },
// Pada akhir fase C, peserta didik memiliki kemampuan berbahasa untuk
// berkomunikasi dan bernalar sesuai dengan tujuan dan konteks sosial. Peserta
// didik menunjukkan minat terhadap teks, mampu memahami, mengolah, dan
// menginterpretasi informasi dan pesan dari paparan lisan dan tulis tentang topik
// yang dikenali dalam teks narasi dan informatif. Peserta didik mampu menanggapi
// dan mempresentasikan informasi yang dipaparkan; berpartisipasi aktif dalam
// diskusi; menuliskan tanggapannya terhadap bacaan menggunakan pengalaman
// dan pengetahuannya; menulis teks untuk menyampaikan pengamatan dan
// pengalamannya dengan lebih terstruktur. Peserta didik memiliki kebiasaan
// membaca untuk hiburan, menambah pengetahuan, dan keterampilan.
    {
        id_program: 9,
        nama_program: 'Bahasa Indonesia Kelas 3 SD',
        tujuan_pembelajaran: `Mampu berkomunikasi dan bernalar sesuai dengan tujuan dan konteks sosial
Menunjukkan minat terhadap teks, mampu memahami, mengolah, dan menginterpretasi informasi
Mampu menanggapi dan mempresentasikan informasi`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/bahasa-indonesia.png`,
        topik : [
            {
                id_topik: 22,
                nama_topik: 'Berkomunikasi Efektif',
                kegiatan: [
                    {
                        id_kegiatan: 42,
                        nama_kegiatan: '[Tata Muka] Berkomunikasi Efektif (Part 1)',
                        deskripsi: 'Berkomunikaasi efektif (Part 1)',
                        instruksi_guru: 'Bacakan buku halaman 3',
                        instruksi_murid: 'Bacalah buku halaman 3'
                    },
                    {
                        id_kegiatan: 43,
                        nama_kegiatan: '[Tatap Muka] Berkomunikasi Efektif (Part 2)',
                        deskripsi: 'Berkomunikaasi efektif (Part 2)',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Bacalah buku halaman 5'
                    }
                ]
            },
            {
                id_topik: 23,
                nama_topik: 'Memahami dan Mengolah Informasi',
                kegiatan: [
                    {
                        id_kegiatan: 44,
                        nama_kegiatan: '[Tatap Muka] Memahami dan Mengolah Informasi',
                        deskripsi: 'Memahami dan mengolah informasi',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Bacalah buku halaman 10',
                    },
                    {
                        id_kegiatan: 45,
                        nama_kegiatan: '[Tatap Muka] Menanggapi Informasi',
                        deskripsi: 'Menanggapi informasi',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Bacalah buku halaman 15',
                    }
                ]
            },
            {
                id_topik: 24,
                nama_topik: 'Menulis Teks',
                kegiatan: [
                    {
                        id_kegiatan: 46,
                        nama_kegiatan: '[Tatap Muka] Menulis Teks',
                        deskripsi: 'Menulis teks',
                        instruksi_guru: 'Bacakan buku halaman 20',
                        instruksi_murid: 'Bacalah buku halaman 20',
                    }
                ]
            }
        ]
    },
// Pada akhir fase D, peserta didik memiliki kemampuan berbahasa untuk
// berkomunikasi dan bernalar sesuai dengan tujuan, konteks sosial, dan akademis.
// Peserta didik mampu memahami, mengolah, dan menginterpretasi informasi
// paparan tentang topik yang beragam dan karya sastra. Peserta didik mampu
// berpartisipasi aktif dalam diskusi, mempresentasikan, dan menanggapi informasi
// nonfiksi dan fiksi yang dipaparkan; Peserta didik menulis berbagai teks untuk
// menyampaikan pengamatan dan pengalamannya dengan lebih terstruktur,
// dan menuliskan tanggapannya terhadap paparan dan bacaan menggunakan
// pengalaman dan pengetahuannya. Peserta didik mengembangkan kompetensi diri
// melalui pajanan berbagai teks untuk penguatan karakter.
    {
        id_program: 10,
        nama_program: 'Bahasa Indonesia Kelas 4 SD',
        tujuan_pembelajaran: `Mampu berkomunikasi dan bernalar sesuai dengan tujuan, konteks sosial, dan akademis
Mampu memahami, mengolah, dan menginterpretasi informasi
Mampu berpartisipasi aktif dalam diskusi`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/bahasa-indonesia.png`,
        topik : [
            {
                id_topik: 25,
                nama_topik: 'Mengolah Informasi',
                kegiatan: [
                    {
                        id_kegiatan: 47,
                        nama_kegiatan: '[Tatap Muka] Mengolah Informasi (Part 1)',
                        deskripsi: 'Mengolah informasi (Part 1)',
                        instruksi_guru: 'Bacakan buku halaman 3',
                        instruksi_murid: 'Bacalah buku halaman 3'
                    },
                    {
                        id_kegiatan: 48,
                        nama_kegiatan: '[Tatap Muka] Mengolah Informasi (Part 2)',
                        deskripsi: 'Mengolah informasi (Part 2)',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Bacalah buku halaman 5'
                    }
                ]
            },
            {
                id_topik: 26,
                nama_topik: 'Menanggapi Informasi',
                kegiatan: [
                    {
                        id_kegiatan: 49,
                        nama_kegiatan: '[Tatap Muka] Menanggapi Informasi',
                        deskripsi: 'Menanggapi informasi',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Bacalah buku halaman 10',
                    },
                    {
                        id_kegiatan: 50,
                        nama_kegiatan: '[Tatap Muka] Menanggapi Informasi (Part 2)',
                        deskripsi: 'Menanggapi informasi (Part 2)',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Bacalah buku halaman 15',
                    }
                ]
            },
            {
                id_topik: 27,
                nama_topik: 'Diskusi dan Partisipasi Aktif',
                kegiatan: [
                    {
                        id_kegiatan: 51,
                        nama_kegiatan: '[Tatap Muka] Diskusi dan Partisipasi Aktif',
                        deskripsi: 'Diskusi dan partisipasi aktif',
                        instruksi_guru: 'Bacakan buku halaman 20',
                        instruksi_murid: 'Bacalah buku halaman 20',
                    },
                    {
                        id_kegiatan: 52,
                        nama_kegiatan: '[Tatap Muka] Diskusi dan Partisipasi Aktif (Part 2)',
                        deskripsi: 'Diskusi dan partisipasi aktif (Part 2)',
                        instruksi_guru: 'Bacakan buku halaman 25',
                        instruksi_murid: 'Bacalah buku halaman 25',
                    }
                ]
            }
        ]
    },
// Pada akhir fase E, peserta didik memiliki kemampuan berbahasa untuk
// berkomunikasi dan bernalar sesuai dengan tujuan, konteks sosial, akademis,
// dan dunia kerja. Peserta didik mampu memahami, mengolah, menginterpretasi,
// dan mengevaluasi informasi dari berbagai tipe teks tentang topik yang beragam.
// Peserta didik mampu menyintesis gagasan dan pendapat dari berbagai sumber.
// Peserta didik mampu berpartisipasi aktif dalam diskusi dan debat. Peserta
// didik mampu menulis berbagai teks untuk menyampaikan pendapat dan
// mempresentasikan serta menanggapi informasi nonfiksi dan fiksi secara kritis dan
// etis.
    {
        id_program: 11,
        nama_program: 'Bahasa Indonesia Kelas 5 SD',
        tujuan_pembelajaran: `Mampu berkomunikasi dan bernalar sesuai dengan tujuan, konteks sosial, akademis, dan dunia kerja
Mampu memahami, mengolah, menginterpretasi, dan mengevaluasi informasi
Mampu menyintesis gagasan dan pendapat dari berbagai sumber`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/bahasa-indonesia.png`,
        topik : [
            {
                id_topik: 28,
                nama_topik: 'Mengevaluasi Informasi',
                kegiatan: [
                    {
                        id_kegiatan: 53,
                        nama_kegiatan: '[Tatap Muka] Mengevaluasi Informasi (Part 1)',
                        deskripsi: 'Mengevaluasi informasi (Part 1)',
                        instruksi_guru: 'Bacakan buku halaman 3',
                        instruksi_murid: 'Bacalah buku halaman 3'
                    },
                    {
                        id_kegiatan: 54,
                        nama_kegiatan: '[Tatap Muka] Mengevaluasi Informasi (Part 2)',
                        deskripsi: 'Mengevaluasi informasi (Part 2)',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Bacalah buku halaman 5'
                    }
                ]
            },
            {
                id_topik: 29,
                nama_topik: 'Menyintesis Gagasan',
                kegiatan: [
                    {
                        id_kegiatan: 55,
                        nama_kegiatan: '[Tatap Muka] Menyintesis Gagasan',
                        deskripsi: 'Menyintesis gagasan',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Bacalah buku halaman 10',
                    },
                    {
                        id_kegiatan: 56,
                        nama_kegiatan: '[Tatap Muka] Menyintesis Gagasan (Part 2)',
                        deskripsi: 'Menyintesis gagasan (Part 2)',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Bacalah buku halaman 15',
                    }
                ]
            },
            {
                id_topik: 30,
                nama_topik: 'Diskusi dan Debat',
                kegiatan: [
                    {
                        id_kegiatan: 57,
                        nama_kegiatan: '[Tatap Muka] Diskusi dan Debat',
                        deskripsi: 'Diskusi dan debat',
                        instruksi_guru: 'Bacakan buku halaman 20',
                        instruksi_murid: 'Bacalah buku halaman 20',
                    },
                    {
                        id_kegiatan: 58,
                        nama_kegiatan: '[Tatap Muka] Diskusi dan Debat (Part 2)',
                        deskripsi: 'Diskusi dan debat (Part 2)',
                        instruksi_guru: 'Bacakan buku halaman 25',
                        instruksi_murid: 'Bacalah buku halaman 25',
                    }
                ]
            }
        ]
    },
// Pada akhir fase F, peserta didik memiliki kemampuan berbahasa untuk
// berkomunikasi dan bernalar sesuai dengan tujuan, konteks sosial, akademis,
// dan dunia kerja. Peserta didik mampu memahami, mengolah, menginterpretasi,
// dan mengevaluasi berbagai tipe teks tentang topik yang beragam. Peserta didik
// mampu mengkreasi gagasan dan pendapat untuk berbagai tujuan. Peserta
// didik mampu berpartisipasi aktif dalam kegiatan berbahasa yang melibatkan
// banyak orang. Peserta didik mampu menulis berbagai teks untuk merefleksi dan
// Capaian Pembelajaran Mata Pelajaran Bahasa Indonesia Fase A Fase F Untuk SD/MI/Program Paket A,
// SMP/MTs/Program Paket B, dan SMA/MA/SMK/MAK/Program Paket C12
// mengaktualisasi diri untuk selalu berkarya dengan mengutamakan penggunaan
// bahasa Indonesia di berbagai media untuk memajukan peradaban bangsa
    {
        id_program: 12,
        nama_program: 'Bahasa Indonesia Kelas 6 SD',
        tujuan_pembelajaran: `Mampu berkomunikasi dan bernalar sesuai dengan tujuan, konteks sosial, akademis, dan dunia kerja
Mampu mengkreasi gagasan dan pendapat untuk berbagai tujuan
Mampu menulis berbagai teks untuk merefleksi dan mengaktualisasi diri`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/bahasa-indonesia.png`,
        topik : [
            {
                id_topik: 31,
                nama_topik: 'Menginterpretasi Teks',
                kegiatan: [
                    {
                        id_kegiatan: 59,
                        nama_kegiatan: '[Tatap Muka] Menginterpretasi Teks (Part 1)',
                        deskripsi: 'Menginterpretasi teks (Part 1)',
                        instruksi_guru: 'Bacakan buku halaman 3',
                        instruksi_murid: 'Bacalah buku halaman 3'
                    },
                    {
                        id_kegiatan: 60,
                        nama_kegiatan: '[Tatap Muka] Menginterpretasi Teks (Part 2)',
                        deskripsi: 'Menginterpretasi teks (Part 2)',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Bacalah buku halaman 5'
                    }
                ]
            },
            {
                id_topik: 32,
                nama_topik: 'Mengevaluasi Teks',
                kegiatan: [
                    {
                        id_kegiatan: 61,
                        nama_kegiatan: '[Tatap Muka] Mengevaluasi Teks',
                        deskripsi: 'Mengevaluasi teks',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Bacalah buku halaman 10',
                    },
                    {
                        id_kegiatan: 62,
                        nama_kegiatan: '[Tatap Muka] Mengevaluasi Teks (Part 2)',
                        deskripsi: 'Mengevaluasi teks (Part 2)',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Bacalah buku halaman 15',
                    }
                ]
            },
            {
                id_topik: 33,
                nama_topik: 'Mengkreasi Gagasan',
                kegiatan: [
                    {
                        id_kegiatan: 63,
                        nama_kegiatan: '[Tatap Muka] Mengkreasi Gagasan',
                        deskripsi: 'Mengkreasi gagasan',
                        instruksi_guru: 'Bacakan buku halaman 20',
                        instruksi_murid: 'Bacalah buku halaman 20',
                    },
                    {
                        id_kegiatan: 64,
                        nama_kegiatan: '[Tata Muka] Mengkreasi Gagasan (Part 2)',
                        deskripsi: 'Mengkreasi gagasan (Part 2)',
                        instruksi_guru: 'Bacakan buku halaman 25',
                        instruksi_murid: 'Bacalah buku halaman 25',
                    }
                ]
            }
        ]
    },
// Pada akhir fase A, peserta didik dapat menunjukkan pemahaman dan memiliki
// intuisi bilangan (number sense) pada bilangan cacah sampai 100, termasuk
// melakukan komposisi (menyusun) dan dekomposisi (mengurai) bilangan
// tersebut. Mereka dapat melakukan operasi penjumlahan dan pengurangan
// pada bilangan cacah sampai 20, dan dapat memahami pecahan setengah dan
// seperempat. Mereka dapat mengenali, meniru, dan melanjutkan pola-pola bukan
// bilangan. Mereka dapat membandingkan panjang, berat, dan durasi waktu, serta
// mengestimasi panjang menggunakan satuan tidak baku.
// Capaian Pembelajaran Mata Pelajaran Matematika Fase A Fase F Untuk SD/MI/Program Paket A,
// SMP/MTs/Program Paket B, dan SMA/MA/Program Paket C10
// Peserta didik dapat mengenal berbagai bangun datar dan bangun ruang, serta
// dapat menyusun dan mengurai bangun datar. Mereka dapat menentukan posisi
// benda terhadap benda lain.
// Peserta didik dapat mengurutkan, menyortir, mengelompokkan, membandingkan,
// dan menyajikan data menggunakan turus dan piktogram paling banyak 4 kategori
    {
        id_program: 13,
        nama_program: 'Matematika Kelas 1 SD',
        tujuan_pembelajaran: `Mampu menunjukkan pemahaman dan memiliki intuisi bilangan
Mampu mengenal berbagai bangun datar dan bangun ruang`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/matematika.png`,
        topik : [
            {
                id_topik: 34,
                nama_topik: 'Intuisi Bilangan',
                kegiatan: [
                    {
                        id_kegiatan: 65,
                        nama_kegiatan: '[Tata Muka] Mengenal Bilangan Cacah',
                        deskripsi: 'Mengenal bilangan cacah',
                        instruksi_guru: 'Bacakan buku halaman 3',
                        instruksi_murid: 'Bacalah buku halaman 3'
                    },
                    {
                        id_kegiatan: 66,
                        nama_kegiatan: '[Tatap Muka] Menyusun dan Mengurai Bilangan Cacah',
                        deskripsi: 'Menyusun dan mengurai bilangan cacah',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Bacalah buku halaman 5'
                    }
                ]
            },
            {
                id_topik: 35,
                nama_topik: 'Bangun Datar dan Bangun Ruang',
                kegiatan: [
                    {
                        id_kegiatan: 67,
                        nama_kegiatan: '[Tatap Muka] Mengenal Bangun Datar',
                        deskripsi: 'Mengenal bangun datar',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Bacalah buku halaman 10',
                    },
                    {
                        id_kegiatan: 68,
                        nama_kegiatan: '[Tatap Muka] Mengenal Bangun Ruang',
                        deskripsi: 'Mengenal bangun ruang',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Bacalah buku halaman 15',
                    }
                ]
            }
        ]
    },
// Pada akhir fase B, peserta didik dapat menunjukkan pemahaman dan intuisi
// bilangan (number sense) pada bilangan cacah sampai 10.000. Mereka dapat
// melakukan operasi penjumlahan dan pengurangan bilangan cacah sampai
// 1.000, dapat melakukan operasi perkalian dan pembagian bilangan cacah, dapat
// mengisi nilai yang belum diketahui dalam sebuah kalimat matematika, dan dapat
// mengidentifikasi, meniru, dan mengembangkan pola gambar atau obyek sederhana
// dan pola bilangan yang berkaitan dengan penjumlahan dan pengurangan bilangan
// cacah sampai 100. Mereka dapat menyelesaikan masalah berkaitan dengan
// kelipatan dan faktor, masalah berkaitan dengan uang menggunakan ribuan sebagai
// satuan. Mereka dapat membandingkan dan mengurutkan antar-pecahan, serta
// dapat mengenali pecahan senilai. Mereka dapat menunjukkan pemahaman dan
// intuisi bilangan (number sense) pada bilangan desimal, dan dapat menghubungkan
// pecahan desimal dan perseratusan dengan persen.
// Peserta didik dapat mengukur panjang dan berat benda menggunakan satuan
// baku, dan dapat menentukan hubungan antar-satuan baku panjang. Mereka dapat
// mengukur dan mengestimasi luas dan volume menggunakan satuan tidak baku dan
// satuan baku berupa bilangan cacah.
// Peserta didik dapat mendeskripsikan ciri berbagai bentuk bangun datar dan dapat
// menyusun (komposisi) dan mengurai (dekomposisi) berbagai bangun datar dengan
// satu cara atau lebih jika memungkinkan.
// Peserta didik dapat mengurutkan, membandingkan, menyajikan, menganalisis
// dan menginterpretasi data dalam bentuk tabel, diagram gambar, piktogram, dan
// diagram batang (skala satu satuan)
    {
        id_program: 14,
        nama_program: 'Matematika Kelas 2 SD',
        tujuan_pembelajaran: `Mampu menunjukkan pemahaman dan intuisi bilangan pada bilangan cacah sampai 10.000
Mampu mengukur panjang dan berat benda menggunakan satuan baku`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/matematika.png`,
        topik : [
            {
                id_topik: 36,
                nama_topik: 'Bilangan Cacah',
                kegiatan: [
                    {
                        id_kegiatan: 69,
                        nama_kegiatan: '[Tatap Muka] Operasi dasar bilangan cacah',
                        deskripsi: 'Operasi dasar bilangan cacah',
                        instruksi_guru: 'Bacakan buku halaman 3',
                        instruksi_murid: 'Bacalah buku halaman 3'
                    },
                    {
                        id_kegiatan: 70,
                        nama_kegiatan: '[Tatap Muka] Operasi Perkalian dan Pembagian',
                        deskripsi: 'Operasi perkalian dan pembagian',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Bacalah buku halaman 5'
                    }
                ]
            },
            {
                id_topik: 37,
                nama_topik: 'Pengukuran Panjang dan Berat',
                kegiatan: [
                    {
                        id_kegiatan: 71,
                        nama_kegiatan: '[Tatap Muka] Pengukuran Panjang',
                        deskripsi: 'Pengukuran panjang',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Bacalah buku halaman 10',
                    },
                    {
                        id_kegiatan: 72,
                        nama_kegiatan: '[Tatap Muka] Pengukuran Berat',
                        deskripsi: 'Pengukuran berat',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Bacalah buku halaman 15',
                    }
                ]
            }
        ]
    },
// Pada akhir fase C, peserta didik dapat menunjukkan pemahaman dan intuisi
// bilangan (number sense) pada bilangan cacah dengan 1.000.000. Mereka dapat
// melakukan operasi aritmetika pada bilangan cacah sampai 100.000. Mereka
// dapat membandingkan dan mengurutkan berbagai pecahan, melakukan operasi
// penjumlahan dan pengurangan pecahan, serta melakukan operasi perkalian dan
// pembagian pecahan dengan bilangan asli. Mereka dapat membandingkan dan
// mengurutkan bilangan desimal dan mengubah pecahan menjadi desimal. Mereka
// dapat mengisi nilai yang belum diketahui dalam sebuah kalimat matematika
// yang berkaitan dengan operasi aritmetika pada bilangan cacah sampai 1000.
// Mereka dapat menyelesaikan masalah yang berkaitan dengan KPK dan FPB dan
// masalah yang berkaitan dengan uang. Mereka dapat mengidentifikasi, meniru,
// dan mengembangkan pola bilangan membesar yang melibatkan perkalian dan
// pembagian. Mereka dapat bernalar secara proporsional dan menggunakan operasi
// perkalian dan pembagian dalam menyelesaikan masalah sehari-hari dengan rasio
// dan atau yang terkait dengan proporsi.
// Peserta didik dapat menentukan keliling dan luas beberapa bentuk bangun
// datar dan gabungannya. Mereka dapat mengonstruksi dan mengurai beberapa
// bangun ruang dan gabungannya, dan mengenali visualisasi spasial. Mereka dapat
// membandingkan karakteristik antar bangun datar dan antar bangun ruang. Mereka
// dapat menentukan lokasi pada peta yang menggunakan sistem berpetak.
// Peserta didik dapat mengurutkan, membandingkan, menyajikan, dan menganalisis
// data banyak benda dan data hasil pengukuran dalam bentuk beberapa visualisasi
// dan dalam tabel frekuensi untuk mendapatkan informasi. Mereka dapat menentukan
// kejadian dengan kemungkinan yang lebih besar dalam suatu percobaan acak
    {
        id_program: 15,
        nama_program: 'Matematika Kelas 3 SD',
        tujuan_pembelajaran: `Mampu menunjukkan pemahaman dan intuisi bilangan pada bilangan cacah dengan 1.000.000
Mampu menentukan keliling dan luas beberapa bentuk bangun datar
Mampu mengurutkan, membandingkan, menyajikan, dan menganalisis data`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/matematika.png`,
        topik : [
            {
                id_topik: 38,
                nama_topik: 'Keliling dan Luas Bangun Datar',
                kegiatan: [
                    {
                        id_kegiatan: 73,
                        nama_kegiatan: '[Tatap Muka] Keliling Bangun Datar',
                        deskripsi: 'Keliling bangun datar',
                        instruksi_guru: 'Bacakan buku halaman 3',
                        instruksi_murid: 'Bacalah buku halaman 3'
                    },
                    {
                        id_kegiatan: 74,
                        nama_kegiatan: '[Tatap Muka] Luas Bangun Datar',
                        deskripsi: 'Luas bangun datar',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Bacalah buku halaman 5'
                    }
                ]
            },
            {
                id_topik: 39,
                nama_topik: 'Mengurutkan, Membandingkan, Menyajikan, dan Menganalisis Data',
                kegiatan: [
                    {
                        id_kegiatan: 75,
                        nama_kegiatan: '[Tatap Muka] Mengurutkan Data',
                        deskripsi: 'Mengurutkan data',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Bacalah buku halaman 10',
                    },
                    {
                        id_kegiatan: 76,
                        nama_kegiatan: '[Tatap Muka] Membandingkan Data',
                        deskripsi: 'Membandingkan data',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Bacalah buku halaman 15',
                    },
                    {
                        id_kegiatan: 77,
                        nama_kegiatan: '[Tatap Muka] Menyajikan Data',
                        deskripsi: 'Menyajikan data',
                        instruksi_guru: 'Bacakan buku halaman 20',
                        instruksi_murid: 'Bacalah buku halaman 20',
                    },
                    {
                        id_kegiatan: 78,
                        nama_kegiatan: '[Tatap Muka] Menganalisis Data',
                        deskripsi: 'Menganalisis data',
                        instruksi_guru: 'Bacakan buku halaman 25',
                        instruksi_murid: 'Bacalah buku halaman 25',
                    }
                ]
            }
        ]
    },
// Pada akhir fase D, peserta didik dapat menyelesaikan masalah kontekstual peserta
// didik dengan menggunakan konsep-konsep dan keterampilan matematika yang
// dipelajari pada fase ini. Mereka mampu mengoperasikan secara efisien bilangan
// bulat, bilangan rasional dan irasional, bilangan desimal, bilangan berpangkat bulat
// dan akar, bilangan dalam notasi ilmiah; melakukan pemfaktoran bilangan prima,
// Capaian Pembelajaran Mata Pelajaran Matematika Fase A Fase F Untuk SD/MI/Program Paket A,
// SMP/MTs/Program Paket B, dan SMA/MA/Program Paket C12
// menggunakan faktor skala, proporsi dan laju perubahan. Mereka dapat menyajikan
// dan menyelesaikan persamaan dan pertidaksamaan linier satu variabel dan
// sistem persamaan linier dengan dua variabel dengan beberapa cara, memahami
// dan menyajikan relasi dan fungsi. Mereka dapat menentukan luas permukaan
// dan volume bangun ruang (prisma, tabung, bola, limas dan kerucut) untuk
// menyelesaikan masalah yang terkait, menjelaskan pengaruh perubahan secara
// proporsional dari bangun datar dan bangun ruang terhadap ukuran panjang, luas,
// dan/atau volume. Mereka dapat membuat jaring-jaring bangun ruang (prisma,
// tabung, limas dan kerucut) dan membuat bangun ruang tersebut dari jaring-
// jaringnya. Mereka dapat menggunakan sifat-sifat hubungan sudut terkait dengan
// garis transversal, sifat kongruen dan kesebangunan pada segitiga dan segiempat.
// Mereka dapat menunjukkan kebenaran teorema Pythagoras dan menggunakannya.
// Mereka dapat melakukan transformasi geometri tunggal di bidang koordinat
// Kartesius. Mereka dapat membuat dan menginterpretasi diagram batang dan
// diagram lingkaran. Mereka dapat mengambil sampel yang mewakili suatu populasi,
// menggunakan mean, median, modus, range untuk menyelesaikan masalah; dan
// menginvestigasi dampak perubahan data terhadap pengukuran pusat. Mereka
// dapat menjelaskan dan menggunakan pengertian peluang, frekuensi relatif dan
// frekuensi harapan satu kejadian pada suatu percobaan sederhana
    {
        id_program: 16,
        nama_program: 'Matematika Kelas 4 SD',
        tujuan_pembelajaran: `Mampu menyelesaikan masalah kontekstual peserta didik dengan menggunakan konsep-konsep dan keterampilan matematika
Mampu menentukan luas permukaan dan volume bangun ruang`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/matematika.png`,
        topik : [
            {
                id_topik: 40,
                nama_topik: 'Operasi Bilangan',
                kegiatan: [
                    {
                        id_kegiatan: 79,
                        nama_kegiatan: '[Tatap Muka] Operasi Bilangan Bulat',
                        deskripsi: 'Operasi bilangan bulat',
                        instruksi_guru: 'Bacakan buku halaman 3',
                        instruksi_murid: 'Bacalah buku halaman 3'
                    },
                    {
                        id_kegiatan: 80,
                        nama_kegiatan: '[Tatap Muka] Operasi Bilangan Pecahan',
                        deskripsi: 'Operasi bilangan pecahan',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Bacalah buku halaman 5'
                    }
                ]
            },
            {
                id_topik: 41,
                nama_topik: 'Luas Permukaan dan Volume Bangun Ruang',
                kegiatan: [
                    {
                        id_kegiatan: 81,
                        nama_kegiatan: '[Tatap Muka] Luas Permukaan Bangun Ruang',
                        deskripsi: 'Luas permukaan bangun ruang',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Bacalah buku halaman 10',
                    },
                    {
                        id_kegiatan: 82,
                        nama_kegiatan: '[Tatap Muka] Volume Bangun Ruang',
                        deskripsi: 'Volume bangun ruang',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Bacalah buku halaman 15',
                    }
                ]
            }
        ]
    },
// Pada akhir fase E, peserta didik dapat menggeneralisasi sifat-sifat operasi bilangan
// berpangkat (eksponen), serta menggunakan barisan dan deret (aritmetika dan
// geometri) dalam bunga tunggal dan bunga majemuk. Mereka dapat menggunakan
// sistem persamaan linear tiga variabel, sistem pertidaksamaan linear dua variabel,
// persamaan dan fungsi kuadrat dan persamaan dan fungsi eksponensial dalam
// menyelesaikan masalah. Mereka dapat menentukan perbandingan trigonometri
// dan memecahkan masalah yang melibatkan segitiga siku-siku. Mereka juga dapat
// menginterpretasi dan membandingkan himpunan data berdasarkan distribusi data,
// menggunakan diagram pencar untuk menyelidiki hubungan data numerik, dan
// mengevaluasi laporan berbasis statistika. Mereka dapat menjelaskan peluang dan
// menentukan frekuensi harapan dari kejadian majemuk, dan konsep dari kejadian
// saling bebas dan saling lepas
    {
        id_program: 17,
        nama_program: 'Matematika Kelas 5 SD',
        tujuan_pembelajaran: `Mampu menggeneralisasi sifat-sifat operasi bilangan berpangkat
Mampu menggunakan sistem persamaan linear tiga variabel`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/matematika.png`,
        topik : [
            {
                id_topik: 42,
                nama_topik: 'Operasi Bilangan Berpangkat',
                kegiatan: [
                    {
                        id_kegiatan: 83,
                        nama_kegiatan: '[Tatap Muka] Operasi Bilangan Berpangkat',
                        deskripsi: 'Operasi bilangan berpangkat',
                        instruksi_guru: 'Bacakan buku halaman 3',
                        instruksi_murid: 'Bacalah buku halaman 3'
                    },
                    {
                        id_kegiatan: 84,
                        nama_kegiatan: '[Tatap Muka] Barisan dan Deret',
                        deskripsi: 'Barisan dan deret',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Bacalah buku halaman 5'
                    }
                ]
            },
            {
                id_topik: 43,
                nama_topik: 'Sistem Persamaan Linear',
                kegiatan: [
                    {
                        id_kegiatan: 85,
                        nama_kegiatan: '[Tatap Muka] Sistem Persamaan Linear',
                        deskripsi: 'Sistem persamaan linear',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Bacalah buku halaman 10',
                    },
                    {
                        id_kegiatan: 86,
                        nama_kegiatan: '[Tatap Muka] Persamaan Kuadrat',
                        deskripsi: 'Persamaan kuadrat',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Bacalah buku halaman 15',
                    }
                ]
            }
        ]
    },
// Pada akhir fase F, peserta didik dapat memodelkan pinjaman dan investasi
// dengan bunga majemuk dan anuitas. Mereka dapat menyatakan data dalam
// bentuk matriks, dan menentukan fungsi invers, komposisi fungsi dan transformasi
// fungsi untuk memodelkan situasi dunia nyata. Mereka dapat menerapkan teorema
// tentang lingkaran, dan menentukan panjang busur dan luas juring lingkaran untuk
// menyelesaikan masalah. Mereka juga dapat melakukan proses penyelidikan
// statistika untuk data bivariat dan mengevaluasi berbagai laporan berbasis statistik
    {
        id_program: 18,
        nama_program: 'Matematika Kelas 6 SD',
        tujuan_pembelajaran: `Mampu memodelkan pinjaman dan investasi
Mampu menyatakan data dalam bentuk matriks`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/matematika.png`,
        topik : [
            {
                id_topik: 44,
                nama_topik: 'Pinjaman dan Investasi',
                kegiatan: [
                    {
                        id_kegiatan: 87,
                        nama_kegiatan: '[Tatap Muka] Pinjaman dan Investasi',
                        deskripsi: 'Pinjaman dan investasi',
                        instruksi_guru: 'Bacakan buku halaman 3',
                        instruksi_murid: 'Bacalah buku halaman 3'
                    },
                    {
                        id_kegiatan: 88,
                        nama_kegiatan: '[Tatap Muka] Bunga Majemuk dan Anuitas',
                        deskripsi: 'Bunga majemuk dan anuitas',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Bacalah buku halaman 5'
                    }
                ]
            },
            {
                id_topik: 45,
                nama_topik: 'Matriks',
                kegiatan: [
                    {
                        id_kegiatan: 89,
                        nama_kegiatan: '[Tatap Muka] Matriks',
                        deskripsi: 'Matriks',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Bacalah buku halaman 10',
                    },
                    {
                        id_kegiatan: 90,
                        nama_kegiatan: '[Tatap Muka] Fungsi Invers',
                        deskripsi: 'Fungsi invers',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Bacalah buku halaman 15',
                    }
                ]
            }
        ]
    },
// Pada akhir Fase A, peserta didik memahami bahwa bahasa Inggris lisan dapat
// membantu mereka berinteraksi dengan orang lain dalam situasi sosial sehari-hari
// dan konteks kelas. Dalam mengembangkan keterampilan menyimak dan berbicara,
// peserta didik mengikuti/merespon instruksi atau pertanyaan sederhana dalam
// bahasa Inggris dan mengucapkan dengan baik kosakata sederhana. Pada Fase A,
// peserta didik banyak menggunakan alat bantu visual dan komunikasi non-verbal
// untuk membantu mereka berkomunikasi. Peserta didik memahami bahwa kegiatan
// membaca merupakan kegiatan individu maupun berkelompok yang bisa dilakukan
// untuk memberikan kesenangan (reading for pleasure). Mereka memahami bahwa
// gambar yang terdapat dalam buku yang dibacakan oleh guru atau gambar yang
// peserta didik amati memiliki arti. Mereka merespon secara lisan, visual, dan/atau
// komunikasi non-verbal terhadap teks sederhana yang dibacakan atau gambar yang
// dilihatnya
    {
        id_program: 19,
        nama_program: 'Bahasa Inggris Kelas 1 SD',
        tujuan_pembelajaran: `Mampu berinteraksi dengan orang lain dalam situasi sosial sehari-hari
Mampu mengikuti instruksi atau pertanyaan sederhana dalam bahasa Inggris`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/bahasa-inggris.png`,
        topik : [
            {
                id_topik: 46,
                nama_topik: 'Bahasa Inggris Lisan',
                kegiatan: [
                    {
                        id_kegiatan: 91,
                        nama_kegiatan: '[Tatap Muka] Berinteraksi dengan Orang Lain',
                        deskripsi: 'Berinteraksi dengan orang lain',
                        instruksi_guru: 'Bacakan buku halaman 3',
                        instruksi_murid: 'Bacalah buku halaman 3'
                    },
                    {
                        id_kegiatan: 92,
                        nama_kegiatan: '[Tatap Muka] Mengikuti Instruksi',
                        deskripsi: 'Mengikuti instruksi',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Bacalah buku halaman 5'
                    }
                ]
            },
            {
                id_topik: 47,
                nama_topik: 'Kosakata Sederhana',
                kegiatan: [
                    {
                        id_kegiatan: 93,
                        nama_kegiatan: '[Tatap Muka] Kosakata Sederhana',
                        deskripsi: 'Kosakata sederhana',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Bacalah buku halaman 10',
                    },
                    {
                        id_kegiatan: 94,
                        nama_kegiatan: '[Tatap Muka] Berbicara dengan Baik',
                        deskripsi: 'Berbicara dengan baik',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Bacalah buku halaman 15',
                    }
                ]
            }
        ]
    },
// Pada akhir Fase B, peserta didik memahami dan merespon teks lisan dan visual
// sederhana dalam bahasa Inggris. Dalam mengembangkan keterampilan menyimak
// dan berbicara, peserta didik mengikuti/merespon instruksi atau pertanyaan
// sederhana dalam bahasa Inggris dan membagikan informasi dengan kosakata
// sederhana. Peserta didik merespon berbagai teks/gambar secara lisan dan tulisan
// sederhana dengan alat bantu visual dan komunikasi non-verbal. Pada Fase B,
// peserta didik dapat berinteraksi dengan menggunakan bahasa Inggris sederhana
    {
        id_program: 20,
        nama_program: 'Bahasa Inggris Kelas 2 SD',
        tujuan_pembelajaran: `Mampu merespon teks lisan dan visual sederhana dalam bahasa Inggris
Mampu membagikan informasi dengan kosakata sederhana`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/bahasa-inggris.png`,
        topik : [
            {
                id_topik: 48,
                nama_topik: 'Teks Lisan dan Visual',
                kegiatan: [
                    {
                        id_kegiatan: 95,
                        nama_kegiatan: '[Tatap Muka] Merespon Teks Lisan',
                        deskripsi: 'Merespon teks lisan',
                        instruksi_guru: 'Bacakan buku halaman 3',
                        instruksi_murid: 'Bacalah buku halaman 3'
                    },
                    {
                        id_kegiatan: 96,
                        nama_kegiatan: '[Tatap Muka] Merespon Teks Visual',
                        deskripsi: 'Merespon teks visual',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Bacalah buku halaman 5'
                    }
                ]
            },
            {
                id_topik: 49,
                nama_topik: 'Kosakata Sederhana',
                kegiatan: [
                    {
                        id_kegiatan: 97,
                        nama_kegiatan: '[Tatap Muka] Berbagi Informasi',
                        deskripsi: 'Berbagi informasi',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Bacalah buku halaman 10',
                    },
                    {
                        id_kegiatan: 98,
                        nama_kegiatan: '[Tatap Muka] Berbicara dengan Baik',
                        deskripsi: 'Berbicara dengan baik',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Bacalah buku halaman 15',
                    }
                ]
            }
        ]
    },
// Pada akhir Fase C, peserta didik memahami dan merespon teks lisan, tulisan, dan
// visual sederhana dalam bahasa Inggris. Mereka menggunakan bahasa Inggris
// sederhana untuk berinteraksi dan berkomunikasi dalam situasi yang familiar/lazim/
// rutin. Peserta didik memahami hubungan bunyi huruf pada kosakata sederhana
// dalam bahasa Inggris dan menggunakan pemahaman tersebut untuk memahami
// dan memproduksi teks tulisan dan visual sederhana dalam bahasa Inggris dengan
// bantuan contoh
    {
        id_program: 21,
        nama_program: 'Bahasa Inggris Kelas 3 SD',
        tujuan_pembelajaran: `Mampu merespon teks lisan, tulisan, dan visual sederhana dalam bahasa Inggris
Mampu berinteraksi dan berkomunikasi dalam situasi yang familiar`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/bahasa-inggris.png`,
        topik : [
            {
                id_topik: 50,
                nama_topik: 'Teks Lisan, Tulisan, dan Visual',
                kegiatan: [
                    {
                        id_kegiatan: 99,
                        nama_kegiatan: '[Tatap Muka] Merespon Teks Lisan',
                        deskripsi: 'Merespon teks lisan',
                        instruksi_guru: 'Bacakan buku halaman 3',
                        instruksi_murid: 'Bacalah buku halaman 3'
                    },
                    {
                        id_kegiatan: 100,
                        nama_kegiatan: '[Tatap Muka] Merespon Teks Tulisan',
                        deskripsi: 'Merespon teks tulisan',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Bacalah buku halaman 5'
                    }
                ]
            },
            {
                id_topik: 51,
                nama_topik: 'Kosakata Sederhana',
                kegiatan: [
                    {
                        id_kegiatan: 101,
                        nama_kegiatan: '[Tatap Muka] Berinteraksi dan Berkomunikasi',
                        deskripsi: 'Berinteraksi dan berkomunikasi',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Bacalah buku halaman 10',
                    },
                    {
                        id_kegiatan: 102,
                        nama_kegiatan: '[Tatap Muka] Produksi Teks Sederhana',
                        deskripsi: 'Produksi teks sederhana',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Bacalah buku halaman 15',
                    }
                ]
            }
        ]
    },
// Pada akhir Fase D, peserta didik menggunakan teks lisan, tulisan dan visual dalam
// bahasa Inggris untuk berinteraksi dan berkomunikasi dalam konteks yang lebih
// beragam dan dalam situasi formal dan informal. Peserta didik dapat menggunakan
// berbagai jenis teks seperti narasi, deskripsi, prosedur, teks khusus (pesan singkat,
// iklan) dan teks otentik menjadi rujukan utama dalam mempelajari bahasa Inggris
// di fase ini. Peserta didik menggunakan bahasa Inggris untuk berdiskusi dan
// menyampaikan keinginan/perasaan. Pemahaman mereka terhadap teks tulisan
// semakin berkembang dan keterampilan inferensi mulai tampak ketika memahami
// informasi tersirat. Mereka memproduksi teks tulisan dan visual dalam bahasa
// Inggris yang terstruktur dengan kosakata yang lebih beragam. Mereka memahami
// tujuan dan pemirsa ketika memproduksi teks tulisan dan visual dalam bahasa
// Inggris.
    {
        id_program: 22,
        nama_program: 'Bahasa Inggris Kelas 4 SD',
        tujuan_pembelajaran: `Mampu berinteraksi dan berkomunikasi dalam konteks yang lebih beragam
Mampu menggunakan berbagai jenis teks`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/bahasa-inggris.png`,
        topik : [
            {
                id_topik: 52,
                nama_topik: 'Teks Lisan, Tulisan, dan Visual',
                kegiatan: [
                    {
                        id_kegiatan: 103,
                        nama_kegiatan: '[Tatap Muka] Berinteraksi dan Berkomunikasi',
                        deskripsi: 'Berinteraksi dan berkomunikasi',
                        instruksi_guru: 'Bacakan buku halaman 3',
                        instruksi_murid: 'Bacalah buku halaman 3'
                    },
                    {
                        id_kegiatan: 104,
                        nama_kegiatan: '[Tatap Muka] Menggunakan Berbagai Jenis Teks',
                        deskripsi: 'Menggunakan berbagai jenis teks',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Bacalah buku halaman 5'
                    }
                ]
            },
            {
                id_topik: 53,
                nama_topik: 'Teks Tulisan dan Visual',
                kegiatan: [
                    {
                        id_kegiatan: 105,
                        nama_kegiatan: '[Tatap Muka] Produksi Teks Tulisan',
                        deskripsi: 'Produksi teks tulisan',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Bacalah buku halaman 10',
                    },
                    {
                        id_kegiatan: 106,
                        nama_kegiatan: '[Tatap Muka] Produksi Teks Visual',
                        deskripsi: 'Produksi teks visual',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Bacalah buku halaman 15',
                    }
                ]
            }
        ]
    },
// Pada akhir Fase E, peserta didik menggunakan teks lisan, tulisan dan visual dalam
// bahasa Inggris untuk berkomunikasi sesuai dengan situasi, tujuan, dan pemirsa/
// pembacanya. Berbagai jenis teks seperti narasi, deskripsi, prosedur, eksposisi,
// recount, report, dan teks otentik menjadi rujukan utama dalam mempelajari bahasa
// Inggris di fase ini. Peserta didik menggunakan bahasa Inggris untuk menyampaikan
// keinginan/perasaan dan berdiskusi mengenai topik yang dekat dengan keseharian
// mereka atau isu yang hangat sesuai usia peserta didik di fase ini. Mereka
// membaca teks tulisan untuk mempelajari sesuatu/mendapatkan informasi.
// Keterampilan inferensi tersirat ketika memahami informasi, dalam bahasa Inggris
// mulai berkembang. Peserta didik memproduksi teks tulisan dan visual yang lebih
// beragam, dengan kesadaran terhadap tujuan dan target pembaca.
    {
        id_program: 23,
        nama_program: 'Bahasa Inggris Kelas 5 SD',
        tujuan_pembelajaran: `Mampu berkomunikasi sesuai dengan situasi, tujuan, dan pemirsa
Mampu menggunakan berbagai jenis teks`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/bahasa-inggris.png`,
        topik : [
            {
                id_topik: 54,
                nama_topik: 'Teks Lisan, Tulisan, dan Visual',
                kegiatan: [
                    {
                        id_kegiatan: 107,
                        nama_kegiatan: '[Tatap Muka] Berkomunikasi Sesuai Situasi',
                        deskripsi: 'Berkomunikasi sesuai situasi',
                        instruksi_guru: 'Bacakan buku halaman 3',
                        instruksi_murid: 'Bacalah buku halaman 3'
                    },
                    {
                        id_kegiatan: 108,
                        nama_kegiatan: '[Tatap Muka] Menggunakan Berbagai Jenis Teks',
                        deskripsi: 'Menggunakan berbagai jenis teks',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Bacalah buku halaman 5'
                    }
                ]
            },
            {
                id_topik: 55,
                nama_topik: 'Teks Tulisan dan Visual',
                kegiatan: [
                    {
                        id_kegiatan: 109,
                        nama_kegiatan: '[Tatap Muka] Produksi Teks Tulisan',
                        deskripsi: 'Produksi teks tulisan',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Bacalah buku halaman 10',
                    },
                    {
                        id_kegiatan: 110,
                        nama_kegiatan: '[Tatap Muka] Produksi Teks Visual',
                        deskripsi: 'Produksi teks visual',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Bacalah buku halaman 15',
                    }
                ]
            }
        ]
    },
// Pada akhir Fase F, peserta didik menggunakan teks lisan, tulisan dan visual
// dalam bahasa Inggris untuk berkomunikasi sesuai dengan situasi, tujuan, dan
// pemirsa/pembacanya. Berbagai jenis teks seperti narasi, deskripsi, eksposisi,
// prosedur, argumentasi, diskusi, dan teks otentik menjadi rujukan utama dalam
// mempelajari bahasa Inggris di fase ini. Peserta didik menggunakan bahasa
// Inggris untuk berdiskusi dan menyampaikan keinginan/perasaan. Peserta didik
// menggunakan keterampilan berbahasa Inggris untuk mengeksplorasi berbagai teks
// dalam berbagai macam topik kontekstual. Mereka membaca teks tulisan untuk
// mempelajari sesuatu/mendapatkan informasi dan untuk kesenangan. Pemahaman
// mereka terhadap teks tulisan semakin mendalam. Keterampilan inferensi tersirat
// ketika memahami informasi, dan kemampuan evaluasi berbagai jenis teks dalam
// bahasa Inggris sudah berkembang. Mereka memproduksi teks lisan dan tulisan
// serta visual dalam bahasa Inggris yang terstruktur dengan kosakata yang lebih
// beragam. Peserta didik memproduksi beragam teks tulisan dan visual, fiksi maupun
// non-fiksi dengan kesadaran terhadap tujuan dan target pembaca/pemirsa
    {
        id_program: 24,
        nama_program: 'Bahasa Inggris Kelas 6 SD',
        tujuan_pembelajaran: `Mampu berkomunikasi sesuai dengan situasi, tujuan, dan pemirsa
Mampu menggunakan berbagai jenis teks`,
        periode_belajar: 'Semester 1',
        tahun_akademik: '2021/2022',
        path_banner: `${BASE_URL}/static/image/banner/bahasa-inggris.png`,
        topik : [
            {
                id_topik: 56,
                nama_topik: 'Teks Lisan, Tulisan, dan Visual',
                kegiatan: [
                    {
                        id_kegiatan: 111,
                        nama_kegiatan: '[Tatap Muka] Berkomunikasi Sesuai Situasi',
                        deskripsi: 'Berkomunikasi sesuai situasi',
                        instruksi_guru: 'Bacakan buku halaman 3',
                        instruksi_murid: 'Bacalah buku halaman 3'
                    },
                    {
                        id_kegiatan: 112,
                        nama_kegiatan: '[Tatap Muka] Menggunakan Berbagai Jenis Teks',
                        deskripsi: 'Menggunakan berbagai jenis teks',
                        instruksi_guru: 'Bacakan buku halaman 5',
                        instruksi_murid: 'Bacalah buku halaman 5'
                    }
                ]
            },
            {
                id_topik: 57,
                nama_topik: 'Teks Tulisan dan Visual',
                kegiatan: [
                    {
                        id_kegiatan: 113,
                        nama_kegiatan: '[Tatap Muka] Produksi Teks Tulisan',
                        deskripsi: 'Produksi teks tulisan',
                        instruksi_guru: 'Bacakan buku halaman 10',
                        instruksi_murid: 'Bacalah buku halaman 10',
                    },
                    {
                        id_kegiatan: 114,
                        nama_kegiatan: '[Tatap Muka] Produksi Teks Visual',
                        deskripsi: 'Produksi teks visual',
                        instruksi_guru: 'Bacakan buku halaman 15',
                        instruksi_murid: 'Bacalah buku halaman 15',
                    }
                ]
            }
        ]
    },
];

const ACTIVITIES : any[] = [];
const TOPICS : any[] = [];

for (let i = 0; i < PROGRAMS.length; i++) {
    for (let j = 0; j < PROGRAMS[i].topik.length; j++) {
        const topic = PROGRAMS[i].topik[j];
        const topicWithProgram = { ...topic, id_program: PROGRAMS[i].id_program };
        TOPICS.push(topicWithProgram);

        for (let k = 0; k < PROGRAMS[i].topik[j].kegiatan.length; k++) {
            const activity = PROGRAMS[i].topik[j].kegiatan[k];
            const activityWithTopic = { ...activity, id_topik: topic.id_topik };
            ACTIVITIES.push(activityWithTopic);
        }
    }
}

const COMPETENCIES = [
    { id_kompetensi: 1, judul_kompetensi: 'Bekerja Sama'},
    { id_kompetensi: 2, judul_kompetensi: 'Mandiri'},
    { id_kompetensi: 3, judul_kompetensi: 'Komunikatif'},
    { id_kompetensi: 4, judul_kompetensi: 'Kreatif'},
    { id_kompetensi: 5, judul_kompetensi: 'Inovatif'},
    { id_kompetensi: 6, judul_kompetensi: 'Kritis'},
    { id_kompetensi: 7, judul_kompetensi: 'Kolaboratif'},
    { id_kompetensi: 8, judul_kompetensi: 'Kepemimpinan'},
    { id_kompetensi: 9, judul_kompetensi: 'Kepedulian'},
    { id_kompetensi: 10, judul_kompetensi: 'Kejujuran'},
    { id_kompetensi: 11, judul_kompetensi: 'Kedisiplinan'}
];

const CLASSES = [
    { id_kelas: 1, nama_kelas: '1A', jenjang: '1 SD'},
    { id_kelas: 2, nama_kelas: '1B', jenjang: '1 SD'},
    { id_kelas: 3, nama_kelas: '1C', jenjang: '1 SD'},
    { id_kelas: 4, nama_kelas: '1D', jenjang: '1 SD'},
    { id_kelas: 5, nama_kelas: '1E', jenjang: '1 SD'},
    { id_kelas: 6, nama_kelas: '2A', jenjang: '2 SD'},
    { id_kelas: 7, nama_kelas: '2B', jenjang: '2 SD'},
    { id_kelas: 8, nama_kelas: '2C', jenjang: '2 SD'},
    { id_kelas: 9, nama_kelas: '2D', jenjang: '2 SD'},
    { id_kelas: 10, nama_kelas: '2E', jenjang: '2 SD'},
    { id_kelas: 11, nama_kelas: '3A', jenjang: '3 SD'},
    { id_kelas: 12, nama_kelas: '3B', jenjang: '3 SD'},
    { id_kelas: 13, nama_kelas: '3C', jenjang: '3 SD'},
    { id_kelas: 14, nama_kelas: '3D', jenjang: '3 SD'},
    { id_kelas: 15, nama_kelas: '3E', jenjang: '3 SD'},
    { id_kelas: 16, nama_kelas: '4A', jenjang: '4 SD'},
    { id_kelas: 17, nama_kelas: '4B', jenjang: '4 SD'},
    { id_kelas: 18, nama_kelas: '4C', jenjang: '4 SD'},
    { id_kelas: 19, nama_kelas: '4D', jenjang: '4 SD'},
    { id_kelas: 20, nama_kelas: '4E', jenjang: '4 SD'},
    { id_kelas: 21, nama_kelas: '5A', jenjang: '5 SD'},
    { id_kelas: 22, nama_kelas: '5B', jenjang: '5 SD'},
    { id_kelas: 23, nama_kelas: '5C', jenjang: '5 SD'},
    { id_kelas: 24, nama_kelas: '5D', jenjang: '5 SD'},
    { id_kelas: 25, nama_kelas: '5E', jenjang: '5 SD'},
    { id_kelas: 26, nama_kelas: '6A', jenjang: '6 SD'},
    { id_kelas: 27, nama_kelas: '6B', jenjang: '6 SD'},
    { id_kelas: 28, nama_kelas: '6C', jenjang: '6 SD'},
    { id_kelas: 29, nama_kelas: '6D', jenjang: '6 SD'},
    { id_kelas: 30, nama_kelas: '6E', jenjang: '6 SD'}
];

const getRandomClassFromJenjang = (jenjang: string) => {
    const classes = CLASSES.filter(c => c.jenjang === jenjang);
    return classes[Math.floor(Math.random() * classes.length)];
}

const STUDENTS = [
    {
        jenjang: '1 SD',
        data : [
            // use 20 attack on titan characters, birth between 2012-2016
            { 
                id_murid: 1, nama_murid: 'Eren Yeager', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01', 
                nisn: '1234567890', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 2, nama_murid: 'Mikasa Ackerman', jenis_kelamin: 'P', tanggal_lahir: '2014-01-01', 
                nisn: '1234567891', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 3, nama_murid: 'Armin Arlert', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01', 
                nisn: '1234567892', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 4, nama_murid: 'Levi Ackerman', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01', 
                nisn: '1234567893', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 5, nama_murid: 'Hange Zoë', jenis_kelamin: 'P', tanggal_lahir: '2015-01-01', 
                nisn: '1234567894', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 6, nama_murid: 'Erwin Smith', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01', 
                nisn: '1234567895', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 7, nama_murid: 'Zeke Yeager', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01', 
                nisn: '1234567896', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 8, nama_murid: 'Annie Leonhart', jenis_kelamin: 'P', tanggal_lahir: '2012-01-01', 
                nisn: '1234567897', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 9, nama_murid: 'Reiner Braun', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01', 
                nisn: '1234567898', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 10, nama_murid: 'Jean Kirstein', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01', 
                nisn: '1234567899', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 11, nama_murid: 'Connie Springer', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01', 
                nisn: '1234567800', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 12, nama_murid: 'Sasha Blouse', jenis_kelamin: 'P', tanggal_lahir: '2012-01-01', 
                nisn: '1234567801', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 13, nama_murid: 'Historia Reiss', jenis_kelamin: 'P', tanggal_lahir: '2015-01-01', 
                nisn: '1234567802', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 14, nama_murid: 'Ymir', jenis_kelamin: 'P', tanggal_lahir: '2014-01-01', 
                nisn: '1234567803', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 15, nama_murid: 'Floch Forster', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01', 
                nisn: '1234567804', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 16, nama_murid: 'Gabi Braun', jenis_kelamin: 'P', tanggal_lahir: '2012-01-01', 
                nisn: '1234567805', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 17, nama_murid: 'Falco Grice', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01', 
                nisn: '1234567806', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 18, nama_murid: 'Pieck Finger', jenis_kelamin: 'P', tanggal_lahir: '2014-01-01', 
                nisn: '1234567807', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 19, nama_murid: 'Porco Galliard', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01', 
                nisn: '1234567808', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 20, nama_murid: 'Colt Grice', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01', 
                nisn: '1234567809', path_foto_profil: getRandomPfp()
            }
        ]
    },
    {
        jenjang: '2 SD',
        data : [
            // use 20 jujutsu kaisen characters, birth between 2012-2016
            { 
                id_murid: 21, nama_murid: 'Yuji Itadori', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567810', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 22, nama_murid: 'Megumi Fushiguro', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01',
                nisn: '1234567811', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 23, nama_murid: 'Nobara Kugisaki', jenis_kelamin: 'P', tanggal_lahir: '2013-01-01',
                nisn: '1234567812', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 24, nama_murid: 'Satoru Gojo', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567813', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 25, nama_murid: 'Panda', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567814', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 26, nama_murid: 'Maki Zenin', jenis_kelamin: 'P', tanggal_lahir: '2014-01-01',
                nisn: '1234567815', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 27, nama_murid: 'Toge Inumaki', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01',
                nisn: '1234567816', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 28, nama_murid: 'Kento Nanami', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567817', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 29, nama_murid: 'Kasumi Miwa', jenis_kelamin: 'P', tanggal_lahir: '2015-01-01',
                nisn: '1234567818', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 30, nama_murid: 'Mai Zenin', jenis_kelamin: 'P', tanggal_lahir: '2014-01-01',
                nisn: '1234567819', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 31, nama_murid: 'Aoi Todo', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01',
                nisn: '1234567820', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 32, nama_murid: 'Pandora', jenis_kelamin: 'P', tanggal_lahir: '2012-01-01',
                nisn: '1234567821', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 33, nama_murid: 'Yuta Okkotsu', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567822', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 34, nama_murid: 'Miguel', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01',
                nisn: '1234567823', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 35, nama_murid: 'Kokichi Muta', jenis_kelamin: 'P', tanggal_lahir: '2013-01-01',
                nisn: '1234567824', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 36, nama_murid: 'Rika Orimoto', jenis_kelamin: 'P', tanggal_lahir: '2012-01-01',
                nisn: '1234567825', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 37, nama_murid: 'Takuma Ino', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567826', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 38, nama_murid: 'Kiyotaka Ijichi', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01',
                nisn: '1234567827', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 39, nama_murid: 'Masamichi Yaga', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01',
                nisn: '1234567828', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 40, nama_murid: 'Suguru Geto', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567829', path_foto_profil: getRandomPfp()
            }
        ]
    },
    {
        jenjang: '3 SD',
        data : [
            // use 20 naruto characters, birth between 2012-2016
            { 
                id_murid: 41, nama_murid: 'Naruto Uzumaki', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567830', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 42, nama_murid: 'Sasuke Uchiha', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01',
                nisn: '1234567831', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 43, nama_murid: 'Sakura Haruno', jenis_kelamin: 'P', tanggal_lahir: '2013-01-01',
                nisn: '1234567832', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 44, nama_murid: 'Kakashi Hatake', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567833', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 45, nama_murid: 'Shikamaru Nara', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567834', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 46, nama_murid: 'Ino Yamanaka', jenis_kelamin: 'P', tanggal_lahir: '2014-01-01',
                nisn: '1234567835', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 47, nama_murid: 'Choji Akimichi', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01',
                nisn: '1234567836', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 48, nama_murid: 'Hinata Hyuga', jenis_kelamin: 'P', tanggal_lahir: '2012-01-01',
                nisn: '1234567837', path_foto_profil: getRandomPfp()
            },
            {
                id_murid: 49, nama_murid: 'Kiba Inuzuka', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567838', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 50, nama_murid: 'Shino Aburame', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01',
                nisn: '1234567839', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 51, nama_murid: 'Rock Lee', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01',
                nisn: '1234567840', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 52, nama_murid: 'Neji Hyuga', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567841', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 53, nama_murid: 'Tenten', jenis_kelamin: 'P', tanggal_lahir: '2015-01-01',
                nisn: '1234567842', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 54, nama_murid: 'Might Guy', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01',
                nisn: '1234567843', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 55, nama_murid: 'Kurenai Yuhi', jenis_kelamin: 'P', tanggal_lahir: '2013-01-01',
                nisn: '1234567844', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 56, nama_murid: 'Asuma Sarutobi', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567845', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 57, nama_murid: 'Kurenai Yuhi', jenis_kelamin: 'P', tanggal_lahir: '2015-01-01',
                nisn: '1234567846', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 58, nama_murid: 'Shizune', jenis_kelamin: 'P', tanggal_lahir: '2014-01-01',
                nisn: '1234567847', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 59, nama_murid: 'Iruka Umino', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01',
                nisn: '1234567848', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 60, nama_murid: 'Konohamaru Sarutobi', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567849', path_foto_profil: getRandomPfp()
            }
        ]
    },
    {
        jenjang: '4 SD',
        data : [
            // use 20 one piece characters, birth between 2012-2016
            { 
                id_murid: 61, nama_murid: 'Monkey D. Luffy', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567850', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 62, nama_murid: 'Roronoa Zoro', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01',
                nisn: '1234567851', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 63, nama_murid: 'Nami', jenis_kelamin: 'P', tanggal_lahir: '2013-01-01',
                nisn: '1234567852', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 64, nama_murid: 'Usopp', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567853', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 65, nama_murid: 'Sanji', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567854', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 66, nama_murid: 'Tony Tony Chopper', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01',
                nisn: '1234567855', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 67, nama_murid: 'Nico Robin', jenis_kelamin: 'P', tanggal_lahir: '2013-01-01',
                nisn: '1234567856', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 68, nama_murid: 'Franky', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567857', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 69, nama_murid: 'Brook', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567858', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 70, nama_murid: 'Jinbe', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01',
                nisn: '1234567859', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 71, nama_murid: 'Vinsmoke Reiju', jenis_kelamin: 'P', tanggal_lahir: '2013-01-01',
                nisn: '1234567860', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 72, nama_murid: 'Vinsmoke Ichiji', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567861', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 73, nama_murid: 'Vinsmoke Niji', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567862', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 74, nama_murid: 'Vinsmoke Yonji', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01',
                nisn: '1234567863', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 75, nama_murid: 'Kozuki Oden', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01',
                nisn: '1234567864', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 76, nama_murid: 'Kozuki Momonosuke', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567865', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 77, nama_murid: 'Kozuki Hiyori', jenis_kelamin: 'P', tanggal_lahir: '2015-01-01',
                nisn: '1234567866', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 78, nama_murid: 'Kozuki Toki', jenis_kelamin: 'P', tanggal_lahir: '2014-01-01',
                nisn: '1234567867', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 79, nama_murid: 'Kozuki Sukiyaki', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01',
                nisn: '1234567868', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 80, nama_murid: 'Kozuki Oden', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567869', path_foto_profil: getRandomPfp()
            }
        ]
    },
    {
        jenjang: '5 SD',
        data : [
            // use 20 bleach characters, birth between 2012-2016
            { 
                id_murid: 81, nama_murid: 'Ichigo Kurosaki', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567870', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 82, nama_murid: 'Rukia Kuchiki', jenis_kelamin: 'P', tanggal_lahir: '2014-01-01',
                nisn: '1234567871', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 83, nama_murid: 'Orihime Inoue', jenis_kelamin: 'P', tanggal_lahir: '2013-01-01',
                nisn: '1234567872', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 84, nama_murid: 'Uryu Ishida', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567873', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 85, nama_murid: 'Renji Abarai', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567874', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 86, nama_murid: 'Yasutora Sado', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01',
                nisn: '1234567875', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 87, nama_murid: 'Kisuke Urahara', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01',
                nisn: '1234567876', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 88, nama_murid: 'Yoruichi Shihoin', jenis_kelamin: 'P', tanggal_lahir: '2012-01-01',
                nisn: '1234567877', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 89, nama_murid: 'Byakuya Kuchiki', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567878', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 90, nama_murid: 'Toshiro Hitsugaya', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01',
                nisn: '1234567879', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 91, nama_murid: 'Sosuke Aizen', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01',
                nisn: '1234567880', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 92, nama_murid: 'Grimmjow Jaegerjaquez', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567881', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 93, nama_murid: 'Ulquiorra Cifer', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567882', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 94, nama_murid: 'Nelliel Tu Odelschwanck', jenis_kelamin: 'P', tanggal_lahir: '2014-01-01',
                nisn: '1234567883', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 95, nama_murid: 'Tier Harribel', jenis_kelamin: 'P', tanggal_lahir: '2013-01-01',
                nisn: '1234567884', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 96, nama_murid: 'Coyote Starrk', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567885', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 97, nama_murid: 'Baraggan Louisenbairn', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567886', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 98, nama_murid: 'Sosuke Aizen', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01',
                nisn: '1234567887', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 99, nama_murid: 'Gin Ichimaru', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01',
                nisn: '1234567888', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 100, nama_murid: 'Kaname Tosen', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567889', path_foto_profil: getRandomPfp()
            }
        ]
    },
    {
        jenjang: '6 SD',
        data : [
            // use 20 one punch man characters, birth between 2012-2016
            { 
                id_murid: 101, nama_murid: 'Saitama', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567890', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 102, nama_murid: 'Genos', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01',
                nisn: '1234567891', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 103, nama_murid: 'Speed-o\'-Sound Sonic', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01',
                nisn: '1234567892', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 104, nama_murid: 'Mumen Rider', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567893', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 105, nama_murid: 'Tatsumaki', jenis_kelamin: 'P', tanggal_lahir: '2015-01-01',
                nisn: '1234567894', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 106, nama_murid: 'Bang', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01',
                nisn: '1234567895', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 107, nama_murid: 'Fubuki', jenis_kelamin: 'P', tanggal_lahir: '2013-01-01',
                nisn: '1234567896', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 108, nama_murid: 'King', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567897', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 109, nama_murid: 'Garou', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567898', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 110, nama_murid: 'Metal Bat', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01',
                nisn: '1234567899', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 111, nama_murid: 'Tanktop Master', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01',
                nisn: '1234567800', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 112, nama_murid: 'Puri-Puri Prisoner', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567801', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 113, nama_murid: 'Watch', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567802', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 114, nama_murid: 'Child Emperor', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01',
                nisn: '1234567803', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 115, nama_murid: 'Zombieman', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01',
                nisn: '1234567804', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 116, nama_murid: 'Drive Knight', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567805', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 117, nama_murid: 'Pig God', jenis_kelamin: 'L', tanggal_lahir: '2015-01-01',
                nisn: '1234567806', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 118, nama_murid: 'Superalloy Darkshine', jenis_kelamin: 'L', tanggal_lahir: '2014-01-01',
                nisn: '1234567807', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 119, nama_murid: 'Flashy Flash', jenis_kelamin: 'L', tanggal_lahir: '2013-01-01',
                nisn: '1234567808', path_foto_profil: getRandomPfp()
            },
            { 
                id_murid: 120, nama_murid: 'Tanktop Tiger', jenis_kelamin: 'L', tanggal_lahir: '2012-01-01',
                nisn: '1234567809', path_foto_profil: getRandomPfp()
            }
        ]
    }
];

const TEACHERS = [
    { id_guru: 1, nama_guru: 'Tony Stark', email: 'tony@sekolahmu.com', password: 'sekolahmu', path_foto_profil: getRandomPfp() },
    { id_guru: 2, nama_guru: 'Steve Rogers', email: 'steve@sekolahmu.com', password: 'sekolahmu', path_foto_profil: getRandomPfp() },
    { id_guru: 3, nama_guru: 'Natasha Romanoff', email: 'natasha@sekolahmu.com', password: 'sekolahmu', path_foto_profil: getRandomPfp() },
    { id_guru: 4, nama_guru: 'Bruce Banner', email: 'bruce@sekolahmu.com', password: 'sekolahmu', path_foto_profil: getRandomPfp() },
    { id_guru: 5, nama_guru: 'Clint Barton', email: 'clint@sekolahmu.com', password: 'sekolahmu', path_foto_profil: getRandomPfp() },
    { id_guru: 6, nama_guru: 'Wanda Maximoff', email: 'wanda@sekolahmu.com', password: 'sekolahmu', path_foto_profil: getRandomPfp() },
    { id_guru: 7, nama_guru: 'Vision', email: 'vision@sekolahmu.com', password: 'sekolahmu', path_foto_profil: getRandomPfp() },
    { id_guru: 8, nama_guru: 'Sam Wilson', email: 'sam@sekolahmu.com', password: 'sekolahmu', path_foto_profil: getRandomPfp() }
]

const teachersProgramMap : Map<string, any[]> = new Map();
const programsName = ["Bahasa_Indonesia", "Matematika", "Pendidikan_Pancasila", "Bahasa_Inggris"];
for (let i = 0; i < TEACHERS.length; i += 2) {
    const pIdx = Math.floor(i / 2);
    teachersProgramMap.set(programsName[pIdx], [TEACHERS[i], TEACHERS[i + 1]]);
}

const BADGES = [
    { id_badge: 1, nama_badge: 'Streak', deskripsi_badge: 'Tidak pernah ada task yang terlewat dalam sehari', path_badge: getRandomPfp() },
    { id_badge: 2, nama_badge: 'Streak Master', deskripsi_badge: 'Tidak pernah ada task yang terlewat dalam seminggu', path_badge: getRandomPfp() },
    { id_badge: 3, nama_badge: 'Streak King', deskripsi_badge: 'Tidak pernah ada task yang terlewat dalam sebulan', path_badge: getRandomPfp() },
    { id_badge: 4, nama_badge: 'Gocap', deskripsi_badge: 'Mengerjakan 50 task', path_badge: getRandomPfp() },
    { id_badge: 5, nama_badge: 'Cepek', deskripsi_badge: 'Mengerjakan 100 task', path_badge: getRandomPfp() },
    { id_badge: 6, nama_badge: 'Konsisten', deskripsi_badge: 'Murid dibawah bimbingan tidak pernah ada yang absen selama seminggu', path_badge: getRandomPfp() },
    { id_badge: 7, nama_badge: 'Ambis', deskripsi_badge: 'Murid dibawah bimbingan tidak pernah ada yang absen selama sebulan', path_badge: getRandomPfp() }
];

const getRandomInt = (min: number, max: number) => { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}
const SCHEDULES: any[] = []
function getRandomDateMay2024() {
    const date = new Date(2024, 4, getRandomInt(1, 31));
    return date.toISOString().split('T')[0];
}

function getRandomWorkTime() { // 07:00 - 16:00
    const hour = getRandomInt(7, 16);
    const minute = getRandomInt(0, 1) === 0 ? '00' : '30';
    return `${hour}:${minute}:00`;
}

for (let i = 0; i < ACTIVITIES.length; i++) {
    const topic = TOPICS[ACTIVITIES[i].id_topik - 1];
    const program = PROGRAMS[topic.id_program - 1];

    const jenjang = getJenjangFromProgram(program.nama_program);
    const classId = getRandomClassFromJenjang(jenjang).id_kelas;
    const date = getRandomDateMay2024();
    const time = getRandomWorkTime();

    SCHEDULES.push({ id_jadwal: i + 1, id_kelas: classId, id_kegiatan: ACTIVITIES[i].id_kegiatan,
        tanggal: date, waktu: time });
}

const seedDatabase = async () => {
    console.log('Seeding database...');

    // INSERT INTO program (id_program, nama_program, tujuan_pembelajaran, periode_belajar, tahun_akademik) VALUES
    // ('1', 'Bahasa Indonesia 2 SD', E'- Menguasai Bahasa Indonesia\n- Menyebutkan nama-nama binatang', 'Semester 1', '2021/2022'),
    // ('2', 'Matematika 2 SD', E'- Menguasai konsep dasar matematika\n- Menguasai operasi pertambahan dan pengurangan', 'Semester 1', '2021/2022'),
    // ('3', 'IPA 2 SD', E'- Memahami konsep dasar IPA\n- Memahami siklus hujan\n- Memahami berbagai cuaca', 'Semester 1', '2021/2022'),
    // ('4', 'Politik Praktis 2 SD', E'- Memahami konsep dasar politik\n- Mampu mengkomunikasikan propaganda\n- Mampu mengontrol opini publik', 'Semester 1', '2021/2022');
    console.log('Seeding program...');
    for (let i = 0; i < PROGRAMS.length; i++) {
        const program = PROGRAMS[i];
        await postgre.query(`
            INSERT INTO program (id_program, nama_program, tujuan_pembelajaran, periode_belajar, tahun_akademik, path_banner) VALUES
            ($1, $2, $3, $4, $5, $6);`
            , [program.id_program, program.nama_program, program.tujuan_pembelajaran, 
                program.periode_belajar, program.tahun_akademik, program.path_banner]
        );
    }

    // INSERT INTO kompetensi (id_kompetensi, judul_kompetensi, logo_path) VALUES
    // ('1', 'Bekerja Sama', 'path/to/logo'),
    // ('2', 'Mandiri', 'path/to/logo'),
    // ('3', 'Komunikatif', 'path/to/logo'),
    // ('4', 'Kreatif', 'path/to/logo'),
    // ('5', 'Inovatif', 'path/to/logo'),
    // ('6', 'Kritis', 'path/to/logo'),
    // ('7', 'Kolaboratif', 'path/to/logo'),
    // ('8', 'Kepemimpinan', 'path/to/logo'),
    // ('9', 'Kepedulian', 'path/to/logo'),
    // ('10', 'Kejujuran', 'path/to/logo'),
    // ('11', 'Kedisiplinan', 'path/to/logo');
    console.log('Seeding kompetensi...');
    for (let i = 0; i < COMPETENCIES.length; i++) {
        const kompetensi = COMPETENCIES[i];
        await postgre.query(`
            INSERT INTO kompetensi (id_kompetensi, judul_kompetensi) VALUES
            ($1, $2);`
            , [kompetensi.id_kompetensi, kompetensi.judul_kompetensi]
        );
    }

    // INSERT INTO kelas (id_kelas, nama_kelas, jenjang) VALUES
    // ('1', '2A', '2 SD'),
    // ('2', '2B', '2 SD'),
    // ('3', '2C', '2 SD');
    console.log('Seeding kelas...');
    for (let i = 0; i < CLASSES.length; i++) {
        const kelas = CLASSES[i];
        await postgre.query(`
            INSERT INTO kelas (id_kelas, nama_kelas, jenjang) VALUES
            ($1, $2, $3);`
            , [kelas.id_kelas, kelas.nama_kelas, kelas.jenjang]
        );
    }

    // INSERT INTO guru (id_guru, nama_guru, email, password, path_foto_profil) VALUES
    // ('1', 'Budi Sudjatmiko', 'budi@budi.com', 'password', 'path/to/foto'),
    // ('2', 'Joko Winarto', 'joko@joko.com', 'password', 'path/to/foto'),
    // ('3', 'Siti Rahayu', 'siti@siti.com', 'password', 'path/to/foto'),
    // ('4', 'Rudi Santoso', 'rudi@rudi.com', 'password', 'path/to/foto');
    console.log('Seeding guru...');
    for (let i = 0; i < TEACHERS.length; i++) {
        const guru = TEACHERS[i];
        await postgre.query(`
            INSERT INTO guru (id_guru, nama_guru, email, password, path_foto_profil) VALUES
            ($1, $2, $3, $4, $5);`
            , [guru.id_guru, guru.nama_guru, guru.email, guru.password, guru.path_foto_profil]
        );
    }

    // INSERT INTO murid (id_murid, nama_murid, jenis_kelamin, tanggal_lahir, nisn, path_foto_profil) VALUES
    // ('1', 'Ani', 'P', '2010-01-01', '1234567890', 'path/to/foto'),
    // ('2', 'Budi', 'L', '2010-01-01', '1234567891', 'path/to/foto'),
    // ('3', 'Cici', 'P', '2010-01-01', '1234567892', 'path/to/foto'),
    // ('4', 'Dodi', 'L', '2010-01-01', '1234567893', 'path/to/foto'),
    // ('5', 'Evi', 'P', '2010-01-01', '1234567894', 'path/to/foto'),
    // ('6', 'Fandi', 'L', '2010-01-01', '1234567895', 'path/to/foto'),
    // ('7', 'Gina', 'P', '2010-01-01', '1234567896', 'path/to/foto'),
    // ('8', 'Hadi', 'L', '2010-01-01', '1234567897', 'path/to/foto'),
    // ('9', 'Ina', 'P', '2010-01-01', '1234567898', 'path/to/foto'),
    // ('10', 'Joni', 'L', '2010-01-01', '1234567899', 'path/to/foto'),
    // ('11', 'Kiki', 'P', '2010-01-01', '1234567800', 'path/to/foto'),
    // ('12', 'Lala', 'P', '2010-01-01', '1234567801', 'path/to/foto'),
    // ('13', 'Momo', 'L', '2010-01-01', '1234567802', 'path/to/foto'),
    // ('14', 'Nunu', 'P', '2010-01-01', '1234567803', 'path/to/foto'),
    // ('15', 'Oki', 'L', '2010-01-01', '1234567804', 'path/to/foto'),
    // ('16', 'Pipi', 'P', '2010-01-01', '1234567805', 'path/to/foto'),
    // ('17', 'Qiqi', 'P', '2010-01-01', '1234567806', 'path/to/foto'),
    // ('18', 'Rara', 'P', '2010-01-01', '1234567807', 'path/to/foto'),
    // ('19', 'Sisi', 'P', '2010-01-01', '1234567808', 'path/to/foto'),
    // ('20', 'Titi', 'P', '2010-01-01', '1234567809', 'path/to/foto'),
    // ('21', 'Uci', 'P', '2010-01-01', '1234567810', 'path/to/foto'),
    // ('22', 'Vivi', 'P', '2010-01-01', '1234567811', 'path/to/foto'),
    // ('23', 'Widi', 'P', '2010-01-01', '1234567812', 'path/to/foto'),
    // ('24', 'Xena', 'P', '2010-01-01', '1234567813', 'path/to/foto'),
    // ('25', 'Yani', 'P', '2010-01-01', '1234567814', 'path/to/foto'),
    // ('26', 'Zara', 'P', '2010-01-01', '1234567815', 'path/to/foto');
    console.log('Seeding murid...');
    for (let i = 0; i < STUDENTS.length; i++) {
        const murid = STUDENTS[i];
        for (let j = 0; j < murid.data.length; j++) {
            const dataMurid = murid.data[j];
            await postgre.query(`
                INSERT INTO murid (id_murid, nama_murid, jenis_kelamin, tanggal_lahir, nisn, path_foto_profil) VALUES
                ($1, $2, $3, $4, $5, $6);`
                , [
                    dataMurid.id_murid, dataMurid.nama_murid, dataMurid.jenis_kelamin, 
                    dataMurid.tanggal_lahir, dataMurid.nisn, dataMurid.path_foto_profil
                ]
            );
        }
    }

    // INSERT INTO badge (id_badge, nama_badge, deskripsi, path_badge) VALUES
    // ('1', 'Streak', 'Tidak pernah ada task yang terlewat dalam sehari', 'path/to/badge'),
    // ('2', 'Streak Master', 'Tidak pernah ada task yang terlewat dalam seminggu', 'path/to/badge'),
    // ('3', 'Streak King', 'Tidak pernah ada task yang terlewat dalam sebulan', 'path/to/badge'),
    // ('4', 'Gocap', 'Mengerjakan 50 task', 'path/to/badge'),
    // ('5', 'Cepek', 'Mengerjakan 100 task', 'path/to/badge'),
    // ('6', 'Konsisten', 'Murid dibawah bimbingan tidak pernah ada yang absen selama seminggu', 'path/to/badge'),
    // ('7', 'Ambis', 'Murid dibawah bimbingan tidak pernah ada yang absen selama sebulan', 'path/to/badge');
    console.log('Seeding badge...');
    for (let i = 0; i < BADGES.length; i++) {
        const badge = BADGES[i];
        await postgre.query(`
            INSERT INTO badge (id_badge, nama_badge, deskripsi, path_badge) VALUES
            ($1, $2, $3, $4);`
            , [badge.id_badge, badge.nama_badge, badge.deskripsi_badge, badge.path_badge]
        );
    }

    // INSERT INTO topik (id_topik, nama_topik, id_program) VALUES
    // ('1', 'Pengenalan Bahasa Indonesia', '1'),
    // ('2', 'Jenis-jenis binatang Darat', '1'),
    // ('3', 'Menyusun kalimat dengan nama binatang', '1'),
    // ('4', 'Teori operasi bilangan', '2'),
    // ('5', 'Demonstrasi Siklus Hujan', '3'),
    // ('6', 'Tipe-tipe Cuaca', '3'),
    // ('7', 'Filosofi dan Praktik politik', '4');
    console.log('Seeding topik...');
    for (let i = 0; i < TOPICS.length; i++) {
        const topic = TOPICS[i];
        await postgre.query(`
            INSERT INTO topik (id_topik, nama_topik, id_program) VALUES
            ($1, $2, $3);`
            , [topic.id_topik, topic.nama_topik, topic.id_program]
        );
    }

    // INSERT INTO program_kompetensi (id_program, id_kompetensi) VALUES
    // ('1', '1'), ('1', '3'), ('1', '6'), ('1', '7'),
    // ('2', '2'), ('2', '3'), ('2', '4'), ('2', '6'), ('2', '7'),('2', '10'),('2', '11'),
    // ('3', '1'), ('3', '4'), ('3', '5'), ('3', '8'), ('3', '9'),
    // ('4', '1'), ('4', '2'), ('4', '3'), ('4', '4'), ('4', '5'), ('4', '6'), ('4', '7'), ('4', '8'), ('4', '9'), ('4', '11');
    console.log('Seeding program\'s competencies...');
    for (let i = 0; i < PROGRAMS.length; i++) {
        // pick 5 random competencies no duplicates
        const randomCompetencies: { id_kompetensi: number; }[] = [];
        while (randomCompetencies.length < 5) {
            const randomIndex = getRandomInt(0, COMPETENCIES.length - 1);
            if (!randomCompetencies.includes(COMPETENCIES[randomIndex])) {
                randomCompetencies.push(COMPETENCIES[randomIndex]);
            }
        }

        for (let j = 0; j < randomCompetencies.length; j++) {
            await postgre.query(`
                INSERT INTO program_kompetensi (id_program, id_kompetensi) VALUES
                ($1, $2);`
                , [PROGRAMS[i].id_program, randomCompetencies[j].id_kompetensi]
            );
        }
    }

    // INSERT INTO kegiatan (id_kegiatan, nama_kegiatan, deskripsi, id_topik, id_guru, instruksi_guru, instruksi_murid) VALUES
    // ('1', 'Pengenalan Bahasa Indonesia', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ', 
    //   '1', '1','- Bacakan buku halaman 1', E'- Bacalah buku halaman 1\n- Tulislah 5 kata yang kamu ketahui'),
    // ('2', 'Mengenal binatang', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
    //   '2', '1','- Bacakan buku halaman 2', E'- Baca buku halaman 2\n- Tulislah 5 binatang yang kamu ketahui'),
    // ('3', 'Menyusun kalimat dengan nama binatang', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
    //   '3', '1','- Bacakan buku halaman 3', E'- Baca buku halaman 3\n- Susunlah kalimat dengan nama binatang yang kamu ketahui'),
    // ('4', 'Ulangan Bahasa Indonesia', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
    //   '3', '1','- Bagikan lembar ulangan', E'- Kerjakan soal ulangan yang diberikan'),
    // ('5', 'Operasi Bilangan dan Latihan pertambahan dan pengurangan', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
    //   '4', '2', E'- Jelaskan pertambahan dan pengurangan\n- Penjelasan contoh soal','- Kerjakan contoh soal di papan tulis'),
    // ('6', 'Operasi Bilangan dan Latihan pertambahan dan pengurangan 2', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
    //   '4', '2', E'- Berikan contoh soal latihan\n- Penjelasan contoh soal','- Kerjakan contoh soal di papan tulis'),
    // ('7', 'Ulangan Matematika', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
    //   '4', '2','- Bagikan lembar ulangan', E'- Kerjakan lembar ulangan'),
    // ('8', 'Pengenalan IPA dan Siklus Hujan', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
    //   '5', '3', E'- Jelaskan siklus hujan\n- Penjelasan contoh siklus hujan','- Kerjakan contoh siklus hujan di papan tulis'),
    // ('9', 'Tipe-tipe Cuaca di Dunia', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
    //   '6', '3', E'- Jelaskan tipe-tipe cuaca\n- Penjelasan contoh cuaca','- Kerjakan contoh cuaca di papan tulis'),
    // ('10', 'Tipe cuaca di Indonesia', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
    //   '6', '3', E'- Jelaskan tipe-tipe cuaca di Indonesia\n- Penjelasan contoh cuaca di Indonesia','- Kerjakan contoh cuaca di papan tulis'),
    // ('11', 'Ulangan IPA', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
    //   '6', '3','- Bagikan lembar ulangan', E'- Kerjakan lembar ulangan'),
    // ('12', 'Politik Praktis dan Filosofi Politik', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
    //   '7', '4', E'- Jelaskan filosofi politik\n- Praktikan teknik propaganda dan penggiringan opini',E'- Buat kelompok partai sesuai ideologi masing-masing\n- Simulasikan sidang perwakilan rakyat dengan tidur siang');
    console.log('Seeding activity...');
    for (let i = 0; i < ACTIVITIES.length; i++) {
        const activity = ACTIVITIES[i];
        const topic = TOPICS.find(topic => topic.id_topik === activity.id_topik);
        const program = PROGRAMS.find(program => program.id_program === topic.id_program);
        
        const formattedProgram = predictProgramMapToPdf(program.nama_program);
        const teacher = teachersProgramMap.get(formattedProgram)[getRandomInt(0, 1)];

        await postgre.query(`
            INSERT INTO kegiatan (id_kegiatan, nama_kegiatan, deskripsi, id_topik, id_guru, instruksi_guru, instruksi_murid) VALUES
            ($1, $2, $3, $4, $5, $6, $7);`
            , [activity.id_kegiatan, activity.nama_kegiatan, activity.deskripsi, activity.id_topik, 
                teacher.id_guru, activity.instruksi_guru, activity.instruksi_murid]
        );
    }

    // INSERT INTO konten (id_konten, nama_konten, tipe_konten, nama_file, tipe_file, file_path, id_kegiatan) VALUES
    // ('1', '[PDF] Modul Pembelajaran Baris Berbaris', 'Modul', 'Modul Pembelajaran Baris Berbaris.pdf', 'pdf', 'https://publik.akademik.itb.ac.id/info/2023/Kalender_Pendidikan_ITB_2023-2024_revisi.pdf', '1'),
    // ('13', 'Video Pembelajaran Baris Berbaris', 'Video', 'Video Pembelajaran Baris Berbaris', 'embed', 'https://www.youtube.com/embed/9QH4FGy6_HY', '1'),
    // ('2', 'Presentasi Pengenalan Binatang', 'Buku', 'Presentasi Pengenalan Binatang.pdf', 'pdf', 'path/to/file', '2'),
    // ('3', 'Lembar Kerja Siswa bindo', 'Lembar Kerja', 'Lembar Kerja Siswa bindo.pdf', 'pdf', 'path/to/file', '3'),
    // ('4', 'Soal Ulangan', 'Lembar Kerja', 'Ulangan Bindo.pdf', 'pdf', 'path/to/file', '4'),
    // ('5', 'Buku Paket Matematika Dasar', 'Buku', 'Buku Paket Matematika Dasar.pdf', 'pdf', 'path/to/file', '5'),
    // ('6', 'Lembar Kerja Siswa Mat', 'Lembar Kerja', 'Lembar Kerja Siswa Mat.pdf', 'pdf', 'path/to/file', '6'),
    // ('7', 'Soal Ulangan Matematika', 'Lembar Kerja', 'Ulangan Matematika.pdf', 'pdf', 'path/to/file', '7'),
    // ('8', 'Buku IPA 2 SD', 'Buku', 'Buku IPA 2 SD.pdf', 'pdf', 'path/to/file', '8'),
    // ('9', 'Presentasi Siklus Hujan', 'Buku', 'Presentasi Siklus Hujan.pdf', 'pdf', 'path/to/file', '8'),
    // ('10', 'Lembar Kerja Siswa IPA', 'Lembar Kerja', 'Lembar Kerja Siswa IPA.pdf', 'pdf', 'path/to/file', '9'),
    // ('11', 'Soal Ulangan IPA', 'Lembar Kerja', 'Ulangan IPA.pdf', 'pdf', 'path/to/file', '11'),
    // ('12', 'The Origins of Totalitarianism', 'Buku', 'The Origins of Totalitarianism.pdf', 'pdf', 'path/to/file', '12');
    console.log('Seeding content...');
    let idKonten = 1;
    for (let i = 0; i < ACTIVITIES.length; i++) {
        // 1 pdf content, for each activity
        const activity = ACTIVITIES[i];
        const topic = TOPICS.find(topic => topic.id_topik === activity.id_topik);
        const program = PROGRAMS.find(program => program.id_program === topic.id_program);

        const pdfPath = getPdfFor(program.nama_program);
        let pdfFileName = pdfPath.split('/').pop().split('.')[0]

        await postgre.query(`
            INSERT INTO konten (id_konten, nama_konten, tipe_konten, nama_file, tipe_file, file_path, id_kegiatan) VALUES
            ($1, $2, $3, $4, $5, $6, $7);`
            , [idKonten, `[PDF] ${activity.deskripsi}`, 'Modul', `${pdfFileName}.pdf`, 'pdf', pdfPath, ACTIVITIES[i].id_kegiatan]
        );

        idKonten++;
        
        // 1 - 3 video content, 
        const videosEmbed = []
        for (let j = 0; j < getRandomInt(1, 3); j++) {
            videosEmbed.push(getRandomTedTalkEmbedLink());
        }

        for (let j = 0; j < videosEmbed.length; j++) {
            const videoTitle = `[Video] ${activity.deskripsi}${videosEmbed.length > 1 ? ' - Part ' + (j + 1) : ''}`
            await postgre.query(`
                INSERT INTO konten (id_konten, nama_konten, tipe_konten, nama_file, tipe_file, file_path, id_kegiatan) VALUES
                ($1, $2, $3, $4, $5, $6, $7);`
                , [idKonten, videoTitle, 'Video', videoTitle, 'embed', videosEmbed[j], ACTIVITIES[i].id_kegiatan]
            );

            idKonten++;
        }
    }
    // INSERT INTO kelas_program (id_kelas, id_program) VALUES
    // ('1', '1'), ('1', '2'), ('1', '3'), ('1', '4'),
    // ('2', '1'), ('2', '2'), ('2', '3'), ('2', '4'),
    // ('3', '1'), ('3', '2'), ('3', '3'), ('3', '4');
    console.log('Seeding class program...');
    for (let i = 0; i < CLASSES.length; i++) {
        const kelas = CLASSES[i];
        for (let j = 0; j < PROGRAMS.length; j++) {
            const program = PROGRAMS[j];
            if (kelas.jenjang !== getJenjangFromProgram(program.nama_program)) {
                continue;
            }
            await postgre.query(`
                INSERT INTO kelas_program (id_kelas, id_program) VALUES
                ($1, $2);`
                , [kelas.id_kelas, program.id_program]
            );
        }
    }

    // INSERT INTO jadwal (id_jadwal, tanggal, waktu, lokasi, id_kegiatan, id_kelas) VALUES
    // ('1', '2024-01-01', '08:00:00', 'Ruang 1', '1', '1'),
    // ('2', '2024-01-08', '08:00:00', 'Ruang 1', '2', '1'),
    // ('3', '2024-01-15', '08:00:00', 'Ruang 1', '3', '1'),
    // ('4', '2024-01-01', '09:00:00', 'Ruang 1', '1', '2'),
    // ('5', '2024-01-08', '09:00:00', 'Ruang 1', '2', '2'),
    // ('6', '2024-01-15', '09:00:00', 'Ruang 1', '3', '2'),
    // ('7', '2024-01-01', '10:00:00', 'Ruang 1', '1', '3'),
    // ('8', '2024-01-08', '10:00:00', 'Ruang 1', '2', '3'),
    // ('9', '2024-01-15', '10:00:00', 'Ruang 1', '3', '3'),
    // ('10', '2024-01-22', '08:00:00', 'Ruang 1', '4', '1'),
    // ('11', '2024-01-22', '09:00:00', 'Ruang 1', '4', '2'),
    // ('12', '2024-01-22', '10:00:00', 'Ruang 1', '4', '3'),
    // ('13', '2024-01-01', '09:00:00', 'Ruang 2', '5', '1'),
    // ('14', '2024-01-08', '09:00:00', 'Ruang 2', '6', '1'),
    // ('15', '2024-01-15', '09:00:00', 'Ruang 2', '7', '1'),
    // ('16', '2024-01-01', '10:00:00', 'Ruang 2', '5', '2'),
    // ('17', '2024-01-08', '10:00:00', 'Ruang 2', '6', '2'),
    // ('18', '2024-01-15', '10:00:00', 'Ruang 2', '7', '2'),
    // ('19', '2024-01-01', '11:00:00', 'Ruang 2', '5', '3'),
    // ('20', '2024-01-08', '11:00:00', 'Ruang 2', '6', '3'),
    // ('21', '2024-01-15', '11:00:00', 'Ruang 2', '7', '3'),
    // ('22', '2024-01-02', '08:00:00', 'Ruang 3', '8', '1'),
    // ('23', '2024-01-09', '08:00:00', 'Ruang 3', '9', '1'),
    // ('24', '2024-01-16', '08:00:00', 'Ruang 3', '10', '1'),
    // ('25', '2024-01-02', '09:00:00', 'Ruang 3', '8', '2'),
    // ('26', '2024-01-09', '09:00:00', 'Ruang 3', '9', '2'),
    // ('27', '2024-01-16', '09:00:00', 'Ruang 3', '10', '2'),
    // ('28', '2024-01-02', '10:00:00', 'Ruang 3', '8', '3'),
    // ('29', '2024-01-09', '10:00:00', 'Ruang 3', '9', '3'),
    // ('30', '2024-01-16', '10:00:00', 'Ruang 3', '10', '3'),
    // ('31', '2024-01-23', '08:00:00', 'Ruang 3', '11', '1'),
    // ('32', '2024-01-23', '09:00:00', 'Ruang 3', '11', '2'),
    // ('33', '2024-01-23', '10:00:00', 'Ruang 3', '11', '3'),
    // ('34', '2024-01-02', '10:00:00', 'Ruang 4', '12', '1'),
    // ('35', '2024-01-09', '08:00:00', 'Ruang 4', '12', '2'),
    // ('36', '2024-01-16', '09:00:00', 'Ruang 4', '12', '3');

    console.log('Seeding schedule...');
    for (let i = 0; i < SCHEDULES.length; i++) {
        const schedule = SCHEDULES[i];
        await postgre.query(`
            INSERT INTO jadwal (id_jadwal, tanggal, waktu, lokasi, id_kegiatan, id_kelas) VALUES
            ($1, $2, $3, $4, $5, $6);`
            , [schedule.id_jadwal, schedule.tanggal, schedule.waktu, schedule.lokasi, schedule.id_kegiatan, schedule.id_kelas]
        );
    }

    // INSERT INTO murid_kelas (id_murid, id_kelas) VALUES
    // ('1', '1'), ('2', '1'), ('3', '1'), ('4', '1'), ('5', '1'), ('6', '1'), ('7', '1'), ('8', '1'), ('9', '1'), ('10', '1'),
    // ('11', '2'), ('12', '2'), ('13', '2'), ('14', '2'), ('15', '2'), ('16', '2'), ('17', '2'), ('18', '2'), ('19', '2'), ('20', '2'),
    // ('21', '3'), ('22', '3'), ('23', '3'), ('24', '3'), ('25', '3'), ('26', '3');
    console.log('Seeding student class...');
    for (let i = 0; i < STUDENTS.length; i++) {
        const murid = STUDENTS[i];
        const kelas = CLASSES.filter(kelas => kelas.jenjang === murid.jenjang);
        for (let j = 0; j < kelas.length; j++) {
            for (let k = 0; k < murid.data.length; k++) {
                await postgre.query(`
                    INSERT INTO murid_kelas (id_murid, id_kelas) VALUES
                    ($1, $2);`
                    , [murid.data[k].id_murid, kelas[j].id_kelas]
                );
            }
        }
    }

    // INSERT INTO badge_guru (id_badge, id_guru) VALUES
    // ('1', '1'), ('2', '1'), ('3', '1'), ('4', '1'), ('5', '1'), ('6', '1'), ('7', '1'),
    // ('3', '2'), ('7', '2');
    console.log('Seeding badge teacher...');
    for (let i = 0; i < TEACHERS.length; i++) {
        const guru = TEACHERS[i];
        const badges = BADGES.filter(badge => badge.id_badge === guru.id_guru);
        for (let j = 0; j < badges.length; j++) {
            await postgre.query(`
                INSERT INTO badge_guru (id_badge, id_guru) VALUES
                ($1, $2);`
                , [badges[j].id_badge, guru.id_guru]
            );
        }
    }

    console.log('Seeding evalutaion...');
    await postgre.query(`
        INSERT INTO evaluasi (id_murid, id_jadwal)
        SELECT m.id_murid, j.id_jadwal
        FROM murid m
        INNER JOIN murid_kelas mk ON m.id_murid = mk.id_murid
        INNER JOIN jadwal j ON j.id_kelas = mk.id_kelas;
    `);
};
// #endregion

const initDatabase = async () => {
    try {
        const main_tables = ['program', 'kompetensi', 'kelas', 'guru', 'murid', 'badge']
        let isEmpty :boolean = true;

        // APPROACH CAREFULY
        // await dropDatabase();

        for (let i = 0; i < main_tables.length; i++) {
            const result = await postgre.query(`
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = '${main_tables[0]}'
                )
            `);

            if (result.rows[0].exists){
                isEmpty = false;
                break;
            }
        }

        if (isEmpty) {
            await createDatabaseSchema();
            console.log('Database schema created');
            
            await seedDatabase();
            console.log('Database seeded');
        } else {
            console.log('Database is not empty, seed function stopped.');
        }
    } catch (err) {
        console.error('Error initializing database:\n', err);
    } finally {
        postgre.end();      
        process.exit();
    }
};

initDatabase();

// console.log(PDFS_PATHS)
// console.log(getPdfFor('Bahasa Indonesia 1 SD'))
// console.log(EMOJI_PATHS)

// #endregion