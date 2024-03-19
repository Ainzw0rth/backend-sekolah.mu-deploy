import postgre from '../database';


const createSchema = async () => {
    try {
      await postgre.query(`
        CREATE TABLE program (
            id_program INTEGER PRIMARY KEY,
            nama_program VARCHAR(255) NOT NULL,
            tujuan_pembelajaran TEXT,
            periode_belajar VARCHAR(255),
            tahun_akademik VARCHAR(50)
        );
  
        CREATE TABLE kegiatan (
            id_kegiatan INTEGER PRIMARY KEY,
            nama_kegiatan VARCHAR(255) NOT NULL,
            nomor_urut INTEGER,
            deskripsi TEXT,
            id_topik INTEGER REFERENCES topik(id_topik),
            id_guru INTEGER REFERENCES guru(id_guru),
            id_kelas INTEGER REFERENCES kelas(id_kelas),
            tanggal DATE,
            waktu TIMESTAMP,
            lokasi VARCHAR(255),
            instruksi_guru TEXT,
            instruksi_murid TEXT
          );
          
        CREATE TABLE topik (
            id_topik INTEGER PRIMARY KEY,
            nama_topik VARCHAR(255) NOT NULL,
            id_program INTEGER REFERENCES program(id_program)
        );
        
        CREATE TABLE kompetensi (
            id_kompetensi INTEGER PRIMARY KEY,
            judul_kompetensi VARCHAR(255) NOT NULL,
            logo_path VARCHAR(255)
        );

        CREATE TABLE program_kompetensi (
            id_program INTEGER REFERENCES program(id_program),
            id_kompetensi INTEGER REFERENCES kompetensi(id_kompetensi),
            PRIMARY KEY (id_program, id_kompetensi)
        );

        CREATE TABLE guru (
            id_guru INTEGER PRIMARY KEY,
            nama_guru VARCHAR(255) NOT NULL,
            email VARCHAR(50) NOT NULL,
            password VARCHAR(100) NOT NULL,
            path_foto_profil VARCHAR(255)
        );

        CREATE TABLE badge_guru (
            id_badge INTEGER REFERENCES badge(id_badge),
            id_guru INTEGER REFERENCES guru(id_guru),
            PRIMARY KEY (id_badge, id_guru)
        );

        CREATE TABLE badge (
            id_badge INTEGER PRIMARY KEY,
            nama_badge VARCHAR(255) NOT NULL,
            deskripsi TEXT,
            path_badge VARCHAR(255)
        );
        )

        CREATE TABLE kelas (
            id_kelas INTEGER PRIMARY KEY,
            nama_kelas VARCHAR(255) NOT NULL,
            jenjang VARCHAR(100),
        );

        CREATE TABLE murid_kelas(
            id_murid INTEGER REFERENCES murid(id_murid),
            id_kelas INTEGER REFERENCES kelas(id_kelas),
            PRIMARY KEY (id_murid, id_kelas)
        )

        CREATE TABLE kelas_program (
            id_kelas INTEGER REFERENCES kelas(id_kelas),
            id_program INTEGER REFERENCES program(id_program),
            PRIMARY KEY (id_kelas, id_program)
        )

        CREATE TABLE guru_kelas (
            id_guru INTEGER REFERENCES guru(id_guru),
            id_kelas INTEGER REFERENCES kelas(id_kelas),
            PRIMARY KEY (id_guru, id_kelas)
        )
        
        CREATE TABLE murid (
            id_murid INTEGER PRIMARY KEY,
            nama_murid VARCHAR(100) NOT NULL,
            jenis_kelamin CHAR(1) NOT NULL,
            tanggal_lahir DATE,
            nisn CHAR(10) NOT NULL,
            path_foto_profil VARCHAR(255),
        );

        CREATE TABLE kegiatan_program (
            id_kegiatan INTEGER REFERENCES kegiatan(id_kegiatan),
            id_program INTEGER REFERENCES program(id_program),
            PRIMARY KEY (id_kegiatan, id_program)
        );

        CREATE TABLE konten (
            id_konten SERIAL PRIMARY KEY,
            nama_konten VARCHAR(255) NOT NULL,
            tipe_konten VARCHAR(50) NOT NULL,
            nama_file VARCHAR(255),
            tipe_file VARCHAR(50),
            file_path VARCHAR(255),
            id_kegiatan INTEGER REFERENCES kegiatan(id_kegiatan)
        );

        CREATE TABLE karya (
          id_karya SERIAL PRIMARY KEY,
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
          id_log SERIAL PRIMARY KEY,
          id_murid INTEGER REFERENCES murid(id_murid),
          id_kegiatan INTEGER REFERENCES kegiatan(id_kegiatan),
          timestamp TIMESTAMP,
          editor INTEGER REFERENCES guru(id_guru),
          action action_enum,
          field VARCHAR(255),
          old_value TEXT,
        )
        
      `);
      console.log('Schema created!');
    } catch (err) {
      console.error('Error creating schema:', err);
    } finally {
      postgre.end();
    }
  };
  
  createSchema();