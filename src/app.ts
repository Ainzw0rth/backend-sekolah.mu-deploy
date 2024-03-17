import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

// Available routes
import indexRouter from './routes/index';
import kegiatanRouter from './routes/kegiatan';
import kontenRouter from './routes/konten';
import programRouter from './routes/program';
import topikRouter from './routes/konten';

const app: Application = express();

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

export default app;
