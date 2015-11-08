'use strict'
var Caller = function (config, socket, onopencallback) {
    var self = this;
    this.connection;
    this.socket = socket;
    this.onopencallback = onopencallback || function () {};

    var log = function (e, obj) {
        console.log(new Date(), "caller", e, obj);
    }
    var logError = function (e, obj) {
        console.error(new Date(), "caller", e, obj);
    }
    var onlocalicecandidate = function (e) {
        if (e.candidate) {
            self.socket.sendIceCandidate(e.candidate);
        }
    }
    var onremoteicecandidate = function (e) {
        var candidate = new RTCIceCandidate(e);
        self.connection.addIceCandidate(candidate);
    }
    var onopen = function (e) {
        self.channel = e.target;
        var channel = e.target;
        log("session opened", channel);
        channel.onmessage = self.onmessage;
        self.sendMessage = function (message) {
            channel.send(message);
        }
        self.onopencallback();
    }
    var onanswer = function (e) {
        var answer = new RTCSessionDescription(e);
        self.connection.setRemoteDescription(answer);
    }

    var connect = function(channelId) {
        channelId = channelId || Math.random() * 10000;
        self.connection = new RTCPeerConnection(config.servers, {});
        var dataChannel = self.connection.createDataChannel(channelId, {});

        self.connection.createOffer(
            function (offer) {
                self.connection.setLocalDescription(offer);
                self.socket.sendOffer(offer);
            },
            function (error) {
                logError(error);
            }
        );
        dataChannel.onopen = onopen;
        self.connection.onicecandidate = onlocalicecandidate;
    }
    this.connect = connect;
    this.onanswer = onanswer;
    this.addIceCandidate = onremoteicecandidate;

    this.sendMessage = function (message) {
        self.connection.send(message);
    }
    this.onmessage = function () {};
};