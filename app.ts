import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

const indexRouter = require('./routes');
const configRouter = require('./routes/config');

const app = express();

// TODO: Добавить подключение к MySQL (phpMyAdmin можно воспользовать на beget)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/config', configRouter);

module.exports = app;
