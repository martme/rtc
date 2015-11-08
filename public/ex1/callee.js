'use strict'
var Callee = function (config, socket) {
    var self = this;
    this.connection;
    this.socket = socket;

    var log = function (e, obj) {
        console.log(new Date(), "callee", e, obj);
    }
    var logError = function (e, obj) {
        console.error(new Date(), "callee", e, obj);
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
        self.channel = e.channel;
        var channel = e.channel;
        log("session opened", channel);
        channel.onmessage = self.onmessage;
        self.sendMessage = function (message) {
            channel.send(message);
        }
    }
    var onoffer = function(e) {
        self.connection = new RTCPeerConnection(config.servers, {});
        var offer = new RTCSessionDescription(e);

        self.connection.setRemoteDescription(offer);
        self.connection.createAnswer(
            function (answer) {
                self.connection.setLocalDescription(answer);
                self.socket.sendAnswer(answer);
            }, 
            function (error) {
                logError(error);
            }
        );
        self.connection.ondatachannel = onopen;
        self.connection.onicecandidate = onlocalicecandidate;
    }
    this.onoffer = onoffer;
    this.addIceCandidate = onremoteicecandidate;

    this.sendMessage = function (message) {};
    this.onmessage = function (e) {};
};