'use strict'
var express = require("express");
var app = express();
app.use(express.static("public"));
var server = require("http").createServer(app);
var io = require("socket.io")(server);

io.on("connection", function (socket) {
    //console.log(io.engine.clientsCount, "sockets");
    socket.emit("joined", io.engine.clientsCount);

    socket.on("broadcast", function (data) {
        socket.broadcast.emit("broadcast", data);
    });
});
server.listen(3000);
