// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

// // available routes
// var indexRouter = require('./routes/index');
// var kontenRouter = require('./routes/konten');

// var app = express();

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// // explicitly stating the routes
// app.use('/', indexRouter);
// app.use('/konten', kontenRouter);

// module.exports = app;

import { Application, Request, Response, NextFunction } from 'express';
const express = require('express');

const app: Application = express();
const port: number = 3000;

const allowCors = (fn: (req: Request, res: Response) => Promise<void>) => async (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  await fn(req, res);
};

app.use(allowCors);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    const jsonData = {
        message: 'Hello World'
    };
    res.json(jsonData);
});

app.get('/konten', (req: Request, res: Response, next: NextFunction) => { 
    const jsonData = {
        message: 'Hello World 2'
    };
    res.json(jsonData);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 
