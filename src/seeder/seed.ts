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
            id_program INTEGER REFERENCES program(id_program),
            tanggal DATE,
            waktu TIMESTAMP,
            lokasi VARCHAR(255)
          );
          
        CREATE TABLE topik (
            id_topik INTEGER PRIMARY KEY,
            nama_topik VARCHAR(255) NOT NULL,
            FK_id_kegiatan INTEGER REFERENCES kegiatan(id_kegiatan)
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

        CREATE TABLE kelas (
            id_kelas INTEGER PRIMARY KEY,
            nama_kelas VARCHAR(255) NOT NULL,
            jenjang VARCHAR(100),
            FK_id_guru INTEGER REFERENCES guru(id_guru)
        );
        
        CREATE TABLE murid (
            id_murid INTEGER PRIMARY KEY,
            nama_murid VARCHAR(100) NOT NULL,
            jenis_kelamin CHAR(1) NOT NULL,
            tanggal_lahir DATE,
            nisn CHAR(10) NOT NULL,
            path_foto_profil VARCHAR(255),
            FK_id_kelas INTEGER REFERENCES kelas(id_kelas)
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
          FK_id_murid INTEGER REFERENCES murid(id_murid),
          tipe_file VARCHAR(5) NOT NULL,
          file_path VARCHAR(255)
        );
  
        CREATE TABLE evaluasi (
          id_kegiatan INTEGER REFERENCES kegiatan(id_kegiatan),
          id_murid INTEGER REFERENCES murid(id_murid),
          penilaian VARCHAR(3),
          catatan TEXT,
          FK_id_karya INTEGER REFERENCES karya(id_karya),
          PRIMARY KEY (id_kegiatan, id_murid)
        );
      `);
      console.log('Schema created!');
    } catch (err) {
      console.error('Error creating schema:', err);
    } finally {
      postgre.end();
    }
  };
  
  createSchema();