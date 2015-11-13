"use strict"
var servers = {
    iceServers: [
        {url:'stun:stun.l.google.com:19302'},
        {url:'stun:stun1.l.google.com:19302'},
        {url:'stun:stun2.l.google.com:19302'},
        {url:'stun:stun3.l.google.com:19302'},
        {url:'stun:stun4.l.google.com:19302'}
    ]
};
var ChatClient = function (username, onpeerconnection) {
    var self = this;
    this.username = username || "user-" + parseInt(1000*Math.random());

    this.onpeerconnection = onpeerconnection || function () {};

    var websocket = new function () {
        var self = this;
        this.send = function (type, destination, payload) {}
        this.sendoffer = function (destination, payload) {
            self.send("offer", destination, payload);
        };
        this.sendanswer = function (destination, payload) {
            self.send("answer", destination, payload);
        };
        this.sendicecandidate = function (destination, payload) {
            self.send("icecandidate", destination, payload);
        };
    };
    var errorFn = function(e) {
        console.error(e);
    };
    var connect = function (peerId) {
        peerId = peerId || "caller bob";
        self.peerConnection = new RTCPeerConnection(servers, {});
        self.dataChannel = self.peerConnection.createDataChannel("myDataChannel", {});

        self.peerConnection.onicecandidate = function (e) {
            if (!e.candidate) return;
            var candidate = new RTCIceCandidate(e.candidate);
            websocket.sendicecandidate(peerId, e.candidate);
        };
        self.dataChannel.onopen = function (e) {
            self.onpeerconnection(self);
        };
        self.peerConnection.createOffer(
            function (offer) {
                self.peerConnection.setLocalDescription(offer);
                websocket.sendoffer(peerId, offer);
            },
            errorFn
        );
    };
    var handleanswer = function (answer, peerId) {
        self.peerConnection.setRemoteDescription(answer);
    };
    var handleoffer = function (offer, peerId) {
        var peerId = peerId || "callee alice"
        self.peerConnection = new RTCPeerConnection(servers, {});
        self.peerConnection.setRemoteDescription(offer);
        self.peerConnection.createAnswer(
            function (answer) {
                self.peerConnection.setLocalDescription(answer);
                websocket.sendanswer(peerId, answer);
            },
            errorFn
        );
        self.peerConnection.onicecandidate = function (e) {
            if (!e.candidate) return;
            var candidate = new RTCIceCandidate(e.candidate);
            websocket.sendicecandidate(peerId, e.candidate);
        };
        self.peerConnection.ondatachannel = function (e) {
            self.dataChannel = e.channel;
            self.onpeerconnection(self);
        };
    };

    var tryConnect = function () {
        var socket = io.connect("");
        socket.on("connect", function () {
            websocket.send = function (type, destination, payload) {
                var message = {
                    _type: type,
                    _destination: destination,
                    _payload: payload
                };
                socket.emit("broadcast", JSON.stringify(message));
            };
        });
        socket.on("joined", function (count) {
            console.log("count", count);
            if (count > 1) {
                console.log("connecting");
                connect();
            } else {
                console.log("Waiting for someone to join the room.");
            }
        });
        socket.on("broadcast", function (e) {
            var data = JSON.parse(e);

            if (data._type === "offer") {
                var offer = new RTCSessionDescription(data._payload);
                handleoffer(offer);
            }
            else if (data._type === "answer" && self.peerConnection) {
                var answer = new RTCSessionDescription(data._payload);
                handleanswer(answer);
            }
            else if (data._type === "icecandidate" && self.peerConnection) {
                var candidate = new RTCIceCandidate(data._payload);
                self.peerConnection.addIceCandidate(candidate);
            }
            else {
                console.error("received uncaught broadcast", data);
            }
        });
    };
    tryConnect();
}
