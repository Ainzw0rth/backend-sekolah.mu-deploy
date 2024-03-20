import postgre from '../database';

const tables = ['program', 'kompetensi', 'kelas', 'murid', 'guru','badge', 'topik', 'kegiatan', 'jadwal', 'program_kompetensi', 'badge_guru', 'murid_kelas', 'kelas_program', 'konten', 'karya', 'evaluasi', 'evaluasi_log'];
const enum_names = ['kehadiran_enum', 'action_enum'];

const createSchema = async () => {
      await postgre.query(`
        CREATE TABLE program (
            id_program INTEGER PRIMARY KEY,
            nama_program VARCHAR(255) NOT NULL,
            tujuan_pembelajaran TEXT,
            periode_belajar VARCHAR(255),
            tahun_akademik VARCHAR(50)
        );

        CREATE TABLE kompetensi (
          id_kompetensi INTEGER PRIMARY KEY,
          judul_kompetensi VARCHAR(255) NOT NULL,
          logo_path VARCHAR(255)
        );

        CREATE TABLE kelas (
          id_kelas INTEGER PRIMARY KEY,
          nama_kelas VARCHAR(255) NOT NULL,
          jenjang VARCHAR(100)
        );

        CREATE TABLE guru (
          id_guru INTEGER PRIMARY KEY,
          nama_guru VARCHAR(255) NOT NULL,
          email VARCHAR(50) NOT NULL,
          password VARCHAR(100) NOT NULL,
          path_foto_profil VARCHAR(255)
        );

        CREATE TABLE murid (
          id_murid INTEGER PRIMARY KEY,
          nama_murid VARCHAR(100) NOT NULL,
          jenis_kelamin CHAR(1) NOT NULL,
          tanggal_lahir DATE,
          nisn CHAR(10) NOT NULL,
          path_foto_profil VARCHAR(255)
        );

        CREATE TABLE badge (
          id_badge INTEGER PRIMARY KEY,
          nama_badge VARCHAR(255) NOT NULL,
          deskripsi TEXT,
          path_badge VARCHAR(255)
      );

      CREATE TABLE topik (
        id_topik INTEGER PRIMARY KEY,
        nama_topik VARCHAR(255) NOT NULL,
        id_program INTEGER REFERENCES program(id_program)
      );

  
      CREATE TABLE kegiatan (
          id_kegiatan INTEGER PRIMARY KEY,
          nama_kegiatan VARCHAR(255) NOT NULL,
          deskripsi TEXT,
          id_topik INTEGER REFERENCES topik(id_topik),
          id_guru INTEGER REFERENCES guru(id_guru),
          instruksi_guru TEXT,
          instruksi_murid TEXT
        );
        
      CREATE TABLE jadwal (
          id_jadwal INTEGER PRIMARY KEY,
          tanggal DATE NOT NULL,
          waktu TIME NOT NULL,
          lokasi VARCHAR(255),
          id_kegiatan INTEGER REFERENCES kegiatan(id_kegiatan),
          id_kelas INTEGER REFERENCES kelas(id_kelas)
      );
          

      CREATE TABLE program_kompetensi (
          id_program INTEGER REFERENCES program(id_program),
          id_kompetensi INTEGER REFERENCES kompetensi(id_kompetensi),
          PRIMARY KEY (id_program, id_kompetensi)
      );

      CREATE TABLE badge_guru (
          id_badge INTEGER REFERENCES badge(id_badge),
          id_guru INTEGER REFERENCES guru(id_guru),
          PRIMARY KEY (id_badge, id_guru)
      );

      CREATE TABLE murid_kelas(
          id_murid INTEGER REFERENCES murid(id_murid),
          id_kelas INTEGER REFERENCES kelas(id_kelas),
          PRIMARY KEY (id_murid, id_kelas)
      );

      CREATE TABLE kelas_program (
          id_kelas INTEGER REFERENCES kelas(id_kelas),
          id_program INTEGER REFERENCES program(id_program),
          PRIMARY KEY (id_kelas, id_program)
      );

      CREATE TABLE konten (
          id_konten INTEGER PRIMARY KEY,
          nama_konten VARCHAR(255) NOT NULL,
          tipe_konten VARCHAR(50) NOT NULL,
          nama_file VARCHAR(255),
          tipe_file VARCHAR(50),
          file_path VARCHAR(255),
          id_kegiatan INTEGER REFERENCES kegiatan(id_kegiatan)
      );

      CREATE TABLE karya (
        id_karya INTEGER PRIMARY KEY,
        nama_karya VARCHAR(255) NOT NULL,
        id_murid INTEGER REFERENCES murid(id_murid),
        tipe_file VARCHAR(5) NOT NULL,
        file_path VARCHAR(255)
      );

      CREATE TYPE kehadiran_enum AS ENUM ('Hadir', 'Izin', 'Sakit', 'Alpa');

      CREATE TABLE evaluasi (
        id_kegiatan INTEGER REFERENCES kegiatan(id_kegiatan),
        id_murid INTEGER REFERENCES murid(id_murid),
        catatan_kehadiran kehadiran_enum,
        penilaian INTEGER,
        catatan TEXT,
        feedback TEXT,
        id_karya INTEGER REFERENCES karya(id_karya),
        PRIMARY KEY (id_kegiatan, id_murid)
      );

      CREATE TYPE action_enum AS ENUM ('Create', 'Update', 'Delete');

      CREATE TABLE evaluasi_log(
        id_log INTEGER PRIMARY KEY,
        id_murid INTEGER REFERENCES murid(id_murid),
        id_kegiatan INTEGER REFERENCES kegiatan(id_kegiatan),
        timestamp TIMESTAMP,
        editor INTEGER REFERENCES guru(id_guru),
        action action_enum,
        field VARCHAR(255),
        old_value TEXT
      );
        
      `);
      console.log('Schema created!');
  }

  const seedData = async () => {
      await postgre.query(`
        INSERT INTO program (id_program, nama_program, tujuan_pembelajaran, periode_belajar, tahun_akademik) VALUES
        ('1', 'Bahasa Indonesia 2 SD', E'- Menguasai Bahasa Indonesia\n- Menyebutkan nama-nama binatang', 'Semester 1', '2021/2022'),
        ('2', 'Matematika 2 SD', E'- Menguasai konsep dasar matematika\n- Menguasai operasi pertambahan dan pengurangan', 'Semester 1', '2021/2022'),
        ('3', 'IPA 2 SD', E'- Memahami konsep dasar IPA\n- Memahami siklus hujan\n- Memahami berbagai cuaca', 'Semester 1', '2021/2022'),
        ('4', 'Politik Praktis 2 SD', E'- Memahami konsep dasar politik\n- Mampu mengkomunikasikan propaganda\n- Mampu mengontrol opini publik', 'Semester 1', '2021/2022');

        INSERT INTO kompetensi (id_kompetensi, judul_kompetensi, logo_path) VALUES
        ('1', 'Bekerja Sama', 'path/to/logo'),
        ('2', 'Mandiri', 'path/to/logo'),
        ('3', 'Komunikatif', 'path/to/logo'),
        ('4', 'Kreatif', 'path/to/logo'),
        ('5', 'Inovatif', 'path/to/logo'),
        ('6', 'Kritis', 'path/to/logo'),
        ('7', 'Kolaboratif', 'path/to/logo'),
        ('8', 'Kepemimpinan', 'path/to/logo'),
        ('9', 'Kepedulian', 'path/to/logo'),
        ('10', 'Kejujuran', 'path/to/logo'),
        ('11', 'Kedisiplinan', 'path/to/logo');

        INSERT INTO kelas (id_kelas, nama_kelas, jenjang) VALUES
        ('1', '2A', '2 SD'),
        ('2', '2B', '2 SD'),
        ('3', '2C', '2 SD');

        INSERT INTO guru (id_guru, nama_guru, email, password, path_foto_profil) VALUES
        ('1', 'Budi Sudjatmiko', 'budi@budi.com', 'password', 'path/to/foto'),
        ('2', 'Joko Winarto', 'joko@joko.com', 'password', 'path/to/foto'),
        ('3', 'Siti Rahayu', 'siti@siti.com', 'password', 'path/to/foto'),
        ('4', 'Rudi Santoso', 'rudi@rudi.com', 'password', 'path/to/foto');
        
        INSERT INTO murid (id_murid, nama_murid, jenis_kelamin, tanggal_lahir, nisn, path_foto_profil) VALUES
        ('1', 'Ani', 'P', '2010-01-01', '1234567890', 'path/to/foto'),
        ('2', 'Budi', 'L', '2010-01-01', '1234567891', 'path/to/foto'),
        ('3', 'Cici', 'P', '2010-01-01', '1234567892', 'path/to/foto'),
        ('4', 'Dodi', 'L', '2010-01-01', '1234567893', 'path/to/foto'),
        ('5', 'Evi', 'P', '2010-01-01', '1234567894', 'path/to/foto'),
        ('6', 'Fandi', 'L', '2010-01-01', '1234567895', 'path/to/foto'),
        ('7', 'Gina', 'P', '2010-01-01', '1234567896', 'path/to/foto'),
        ('8', 'Hadi', 'L', '2010-01-01', '1234567897', 'path/to/foto'),
        ('9', 'Ina', 'P', '2010-01-01', '1234567898', 'path/to/foto'),
        ('10', 'Joni', 'L', '2010-01-01', '1234567899', 'path/to/foto'),
        ('11', 'Kiki', 'P', '2010-01-01', '1234567800', 'path/to/foto'),
        ('12', 'Lala', 'P', '2010-01-01', '1234567801', 'path/to/foto'),
        ('13', 'Momo', 'L', '2010-01-01', '1234567802', 'path/to/foto'),
        ('14', 'Nunu', 'P', '2010-01-01', '1234567803', 'path/to/foto'),
        ('15', 'Oki', 'L', '2010-01-01', '1234567804', 'path/to/foto'),
        ('16', 'Pipi', 'P', '2010-01-01', '1234567805', 'path/to/foto'),
        ('17', 'Qiqi', 'P', '2010-01-01', '1234567806', 'path/to/foto'),
        ('18', 'Rara', 'P', '2010-01-01', '1234567807', 'path/to/foto'),
        ('19', 'Sisi', 'P', '2010-01-01', '1234567808', 'path/to/foto'),
        ('20', 'Titi', 'P', '2010-01-01', '1234567809', 'path/to/foto'),
        ('21', 'Uci', 'P', '2010-01-01', '1234567810', 'path/to/foto'),
        ('22', 'Vivi', 'P', '2010-01-01', '1234567811', 'path/to/foto'),
        ('23', 'Widi', 'P', '2010-01-01', '1234567812', 'path/to/foto'),
        ('24', 'Xena', 'P', '2010-01-01', '1234567813', 'path/to/foto'),
        ('25', 'Yani', 'P', '2010-01-01', '1234567814', 'path/to/foto'),
        ('26', 'Zara', 'P', '2010-01-01', '1234567815', 'path/to/foto');

        INSERT INTO badge (id_badge, nama_badge, deskripsi, path_badge) VALUES
        ('1', 'Streak', 'Tidak pernah ada task yang terlewat dalam sehari', 'path/to/badge'),
        ('2', 'Streak Master', 'Tidak pernah ada task yang terlewat dalam seminggu', 'path/to/badge'),
        ('3', 'Streak King', 'Tidak pernah ada task yang terlewat dalam sebulan', 'path/to/badge'),
        ('4', 'Gocap', 'Mengerjakan 50 task', 'path/to/badge'),
        ('5', 'Cepek', 'Mengerjakan 100 task', 'path/to/badge'),
        ('6', 'Konsisten', 'Murid dibawah bimbingan tidak pernah ada yang absen selama seminggu', 'path/to/badge'),
        ('7', 'Ambis', 'Murid dibawah bimbingan tidak pernah ada yang absen selama sebulan', 'path/to/badge');

        INSERT INTO topik (id_topik, nama_topik, id_program) VALUES
        ('1', 'Pengenalan Bahasa Indonesia', '1'),
        ('2', 'Jenis-jenis binatang Darat', '1'),
        ('3', 'Menyusun kalimat dengan nama binatang', '1'),
        ('4', 'Teori operasi bilangan', '2'),
        ('5', 'Demonstrasi Siklus Hujan', '3'),
        ('6', 'Tipe-tipe Cuaca', '3'),
        ('7', 'Filosofi dan Praktik politik', '4');

        INSERT INTO program_kompetensi (id_program, id_kompetensi) VALUES
        ('1', '1'), ('1', '3'), ('1', '6'), ('1', '7'),
        ('2', '2'), ('2', '3'), ('2', '4'), ('2', '6'), ('2', '7'),('2', '10'),('2', '11'),
        ('3', '1'), ('3', '4'), ('3', '5'), ('3', '8'), ('3', '9'),
        ('4', '1'), ('4', '2'), ('4', '3'), ('4', '4'), ('4', '5'), ('4', '6'), ('4', '7'), ('4', '8'), ('4', '9'), ('4', '11');

        INSERT INTO kegiatan (id_kegiatan, nama_kegiatan, deskripsi, id_topik, id_guru, instruksi_guru, instruksi_murid) VALUES
        ('1', 'Pengenalan Bahasa Indonesia', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ', 
          '1', '1','- Bacakan buku halaman 1', E'- Bacalah buku halaman 1\n- Tulislah 5 kata yang kamu ketahui'),
        ('2', 'Mengenal binatang', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
          '2', '1','- Bacakan buku halaman 2', E'- Baca buku halaman 2\n- Tulislah 5 binatang yang kamu ketahui'),
        ('3', 'Menyusun kalimat dengan nama binatang', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
          '3', '1','- Bacakan buku halaman 3', E'- Baca buku halaman 3\n- Susunlah kalimat dengan nama binatang yang kamu ketahui'),
        ('4', 'Ulangan Bahasa Indonesia', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
          '3', '1','- Bagikan lembar ulangan', E'- Kerjakan soal ulangan yang diberikan'),
        ('5', 'Operasi Bilangan dan Latihan pertambahan dan pengurangan', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
          '4', '2', E'- Jelaskan pertambahan dan pengurangan\n- Penjelasan contoh soal','- Kerjakan contoh soal di papan tulis'),
        ('6', 'Operasi Bilangan dan Latihan pertambahan dan pengurangan 2', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
          '4', '2', E'- Berikan contoh soal latihan\n- Penjelasan contoh soal','- Kerjakan contoh soal di papan tulis'),
        ('7', 'Ulangan Matematika', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
          '4', '2','- Bagikan lembar ulangan', E'- Kerjakan lembar ulangan'),
        ('8', 'Pengenalan IPA dan Siklus Hujan', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
          '5', '3', E'- Jelaskan siklus hujan\n- Penjelasan contoh siklus hujan','- Kerjakan contoh siklus hujan di papan tulis'),
        ('9', 'Tipe-tipe Cuaca di Dunia', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
          '6', '3', E'- Jelaskan tipe-tipe cuaca\n- Penjelasan contoh cuaca','- Kerjakan contoh cuaca di papan tulis'),
        ('10', 'Tipe cuaca di Indonesia', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
          '6', '3', E'- Jelaskan tipe-tipe cuaca di Indonesia\n- Penjelasan contoh cuaca di Indonesia','- Kerjakan contoh cuaca di papan tulis'),
        ('11', 'Ulangan IPA', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
          '6', '3','- Bagikan lembar ulangan', E'- Kerjakan lembar ulangan'),
        ('12', 'Politik Praktis dan Filosofi Politik', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices nec nunc quis ornare. Proin pulvinar scelerisque ipsum sit amet ornare. Cras accumsan scelerisque quam a viverra. ',
          '7', '4', E'- Jelaskan filosofi politik\n- Praktikan teknik propaganda dan penggiringan opini',E'- Buat kelompok partai sesuai ideologi masing-masing\n- Simulasikan sidang perwakilan rakyat dengan tidur siang');

        INSERT INTO konten (id_konten, nama_konten, tipe_konten, nama_file, tipe_file, file_path, id_kegiatan) VALUES
        ('1', 'Buku Pengenalan Bahasa Indonesia', 'Buku', 'Buku Pengenalan Bahasa Indonesia.pdf', 'pdf', 'path/to/file', '1'),
        ('2', 'Presentasi Pengenalan Binatang', 'Buku', 'Presentasi Pengenalan Binatang.pdf', 'pdf', 'path/to/file', '2'),
        ('3', 'Lembar Kerja Siswa bindo', 'Lembar Kerja', 'Lembar Kerja Siswa bindo.pdf', 'pdf', 'path/to/file', '3'),
        ('4', 'Soal Ulangan', 'Lembar Kerja', 'Ulangan Bindo.pdf', 'pdf', 'path/to/file', '4'),
        ('5', 'Buku Paket Matematika Dasar', 'Buku', 'Buku Paket Matematika Dasar.pdf', 'pdf', 'path/to/file', '5'),
        ('6', 'Lembar Kerja Siswa Mat', 'Lembar Kerja', 'Lembar Kerja Siswa Mat.pdf', 'pdf', 'path/to/file', '6'),
        ('7', 'Soal Ulangan Matematika', 'Lembar Kerja', 'Ulangan Matematika.pdf', 'pdf', 'path/to/file', '7'),
        ('8', 'Buku IPA 2 SD', 'Buku', 'Buku IPA 2 SD.pdf', 'pdf', 'path/to/file', '8'),
        ('9', 'Presentasi Siklus Hujan', 'Buku', 'Presentasi Siklus Hujan.pdf', 'pdf', 'path/to/file', '8'),
        ('10', 'Lembar Kerja Siswa IPA', 'Lembar Kerja', 'Lembar Kerja Siswa IPA.pdf', 'pdf', 'path/to/file', '9'),
        ('11', 'Soal Ulangan IPA', 'Lembar Kerja', 'Ulangan IPA.pdf', 'pdf', 'path/to/file', '11'),
        ('12', 'The Origins of Totalitarianism', 'Buku', 'The Origins of Totalitarianism.pdf', 'pdf', 'path/to/file', '12');

        INSERT INTO kelas_program (id_kelas, id_program) VALUES
        ('1', '1'), ('1', '2'), ('1', '3'), ('1', '4'),
        ('2', '1'), ('2', '2'), ('2', '3'), ('2', '4'),
        ('3', '1'), ('3', '2'), ('3', '3'), ('3', '4');

        INSERT INTO jadwal (id_jadwal, tanggal, waktu, lokasi, id_kegiatan, id_kelas) VALUES
        ('1', '2024-01-01', '08:00:00', 'Ruang 1', '1', '1'),
        ('2', '2024-01-08', '08:00:00', 'Ruang 1', '2', '1'),
        ('3', '2024-01-15', '08:00:00', 'Ruang 1', '3', '1'),
        ('4', '2024-01-01', '09:00:00', 'Ruang 1', '1', '2'),
        ('5', '2024-01-08', '09:00:00', 'Ruang 1', '2', '2'),
        ('6', '2024-01-15', '09:00:00', 'Ruang 1', '3', '2'),
        ('7', '2024-01-01', '10:00:00', 'Ruang 1', '1', '3'),
        ('8', '2024-01-08', '10:00:00', 'Ruang 1', '2', '3'),
        ('9', '2024-01-15', '10:00:00', 'Ruang 1', '3', '3'),
        ('10', '2024-01-22', '08:00:00', 'Ruang 1', '4', '1'),
        ('11', '2024-01-22', '09:00:00', 'Ruang 1', '4', '2'),
        ('12', '2024-01-22', '10:00:00', 'Ruang 1', '4', '3'),
        ('13', '2024-01-01', '09:00:00', 'Ruang 2', '5', '1'),
        ('14', '2024-01-08', '09:00:00', 'Ruang 2', '6', '1'),
        ('15', '2024-01-15', '09:00:00', 'Ruang 2', '7', '1'),
        ('16', '2024-01-01', '10:00:00', 'Ruang 2', '5', '2'),
        ('17', '2024-01-08', '10:00:00', 'Ruang 2', '6', '2'),
        ('18', '2024-01-15', '10:00:00', 'Ruang 2', '7', '2'),
        ('19', '2024-01-01', '11:00:00', 'Ruang 2', '5', '3'),
        ('20', '2024-01-08', '11:00:00', 'Ruang 2', '6', '3'),
        ('21', '2024-01-15', '11:00:00', 'Ruang 2', '7', '3'),
        ('22', '2024-01-02', '08:00:00', 'Ruang 3', '8', '1'),
        ('23', '2024-01-09', '08:00:00', 'Ruang 3', '9', '1'),
        ('24', '2024-01-16', '08:00:00', 'Ruang 3', '10', '1'),
        ('25', '2024-01-02', '09:00:00', 'Ruang 3', '8', '2'),
        ('26', '2024-01-09', '09:00:00', 'Ruang 3', '9', '2'),
        ('27', '2024-01-16', '09:00:00', 'Ruang 3', '10', '2'),
        ('28', '2024-01-02', '10:00:00', 'Ruang 3', '8', '3'),
        ('29', '2024-01-09', '10:00:00', 'Ruang 3', '9', '3'),
        ('30', '2024-01-16', '10:00:00', 'Ruang 3', '10', '3'),
        ('31', '2024-01-23', '08:00:00', 'Ruang 3', '11', '1'),
        ('32', '2024-01-23', '09:00:00', 'Ruang 3', '11', '2'),
        ('33', '2024-01-23', '10:00:00', 'Ruang 3', '11', '3'),
        ('34', '2024-01-02', '10:00:00', 'Ruang 4', '12', '1'),
        ('35', '2024-01-09', '08:00:00', 'Ruang 4', '12', '2'),
        ('36', '2024-01-16', '09:00:00', 'Ruang 4', '12', '3');

        INSERT INTO murid_kelas (id_murid, id_kelas) VALUES
        ('1', '1'), ('2', '1'), ('3', '1'), ('4', '1'), ('5', '1'), ('6', '1'), ('7', '1'), ('8', '1'), ('9', '1'), ('10', '1'),
        ('11', '2'), ('12', '2'), ('13', '2'), ('14', '2'), ('15', '2'), ('16', '2'), ('17', '2'), ('18', '2'), ('19', '2'), ('20', '2'),
        ('21', '3'), ('22', '3'), ('23', '3'), ('24', '3'), ('25', '3'), ('26', '3');

        INSERT INTO badge_guru (id_badge, id_guru) VALUES
        ('1', '1'), ('2', '1'), ('3', '1'), ('4', '1'), ('5', '1'), ('6', '1'), ('7', '1'),
        ('3', '2'), ('7', '2');

      `);
  };


  const initDatabase = async () => {
    try {
      const main_tables = ['program', 'kompetensi', 'kelas', 'guru', 'murid', 'badge']
      let isEmpty :boolean = true;

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
        await createSchema();
        await seedData();
        console.log('Database initialized');
      } else {
        console.log('Database is not empty');
      }
    } catch (err) {
      for(let i = 0; i < tables.length; i++){
        await postgre.query(`DROP TABLE IF EXISTS ${tables[i]} CASCADE`);
      }
      for (let i = 0; i < enum_names.length; i++){
        await postgre.query(`DROP TYPE IF EXISTS ${enum_names[i]} CASCADE`);
      }
      console.error('Error initializing database:\n', err);
    }
  };

initDatabase();