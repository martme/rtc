'use strict'

var express = require("express");

var app = express();
app.use(express.static('public'));
var server = require("http").createServer(app);
var io = require("socket.io")(server);

io.on("connection", function () {

});
server.listen(3000);