'use strict'
var express = require("express");
var app = express();
app.use(express.static("public"));
var server = require("http").createServer(app);
var io = require("socket.io")(server);

io.on("connection", function (socket) {
    socket.emit("joined", io.engine.clientsCount);
    socket.on("hello", function (username) {
        socket.broadcast.emit("hello", username);
    });
    socket.on("broadcast", function (data) {
        socket.broadcast.emit("broadcast", data);
    });
});
server.listen(80);
