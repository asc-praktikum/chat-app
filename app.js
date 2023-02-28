const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const chatRouter = require('./routes/chat');

const http = require("http");

const app = express();

const server = http.Server(app);
const {Server} = require("socket.io");
const io = new Server(server);


io.on('connection', (socket) => {
    console.log('a user connected');
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/chat', chatRouter);

module.exports = app;
