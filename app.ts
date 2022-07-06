import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

const indexRouter = require('./routes');
const configRouter = require('./routes/config');
const usersRouter = require('./routes/users');
const reportsRouter = require('./routes/reports');

const app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');

app.use('/', indexRouter);
app.use('/config', configRouter);
app.use('/users', usersRouter)
app.use('/reports', reportsRouter)

module.exports = app;