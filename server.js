'use strict'

var express = require("express");

var app = express();
app.use(express.static('public'));
var server = require("http").createServer(app);
var io = require("socket.io")(server);

io.on("connection", function (socket) {
    socket.on('icecandidate', function (obj) {
        socket.broadcast.emit("icecandidate", obj);
    });
    socket.on('offer', function (obj) {
        socket.broadcast.emit("offer", obj);
    });
    socket.on('answer', function (obj) {
        socket.broadcast.emit("answer", obj);
    });
});
server.listen(3000);