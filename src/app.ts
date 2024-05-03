var express = require('express');
import { Application } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

// Available routes
import indexRouter from './routes/index';
import kegiatanRouter from './routes/kegiatan';
import kontenRouter from './routes/konten';
import programRouter from './routes/program';
import topikRouter from './routes/konten';
import evaluasiRouter from './routes/evaluasi';
// import hasilKaryaRouter from './routes/hasil_karya';
import evaluasiLogRouter from './routes/evaluasi_log';
import presensiRouter from './routes/presensi';
import profilRouter from './routes/profil';
import muridRouter from './routes/murid';
import kelasRouter from './routes/kelas';
import tugasTertundaRouter from './routes/tugas_tertunda';
import jadwalRouter from './routes/jadwal';

const cors = require('cors');
const corsConfig = {
  origin: "*",
  credential: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
}

const app: Application = express();
const port: number = 3000;

app.options("", cors(corsConfig))
app.use(cors(corsConfig))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Explicitly stating the routes
app.use('/', indexRouter);
app.use('/kegiatan', kegiatanRouter);
app.use('/konten', kontenRouter);
app.use('/program', programRouter);
app.use('/topik', topikRouter);
app.use('/evaluasi', evaluasiRouter);
// app.use('/hasil_karya', hasilKaryaRouter);
app.use('/evaluasi-log', evaluasiLogRouter);
app.use('/presensi', presensiRouter);
app.use('/profil', profilRouter);
app.use('/murid', muridRouter);
app.use('/kelas', kelasRouter);
app.use('/tugastertunda', tugasTertundaRouter);
app.use('/jadwal', jadwalRouter);

app.listen(port, '0.0.0.0', function() {
    console.log('Listening on port 3000');
  });

export default app;