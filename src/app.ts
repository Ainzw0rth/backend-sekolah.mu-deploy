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

const cors = require('cors');
const corsConfig = {
  origin: "*",
  credential: true,
  methods: ["GET,HEAD,PUT,PATCH,POST,DELETE"],
}

const app: Application = express();
const port: number = 3000;

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

app.listen(port, '0.0.0.0', function() {
    console.log('Listening on port 3000');
  });

// export default app;
