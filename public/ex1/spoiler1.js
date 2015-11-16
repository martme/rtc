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
var ChatClient = function (username) {
    var self = this;
    this.username = username || "user-" + parseInt(1000*Math.random());

    var console = stdout || console;
    this.onpeerconnection = function () {};

    var websocket = new (function (username) {
        var username = username;
        var self = this;
        this.send = function (type, destination, payload) {}
        this.sendoffer = function (destination, payload) {
            console.info("sending offer to " + destination);
            self.send("offer", destination, payload);
        };
        this.sendanswer = function (destination, payload) {
            console.info("sending answer to " + destination);
            self.send("answer", destination, payload);
        };
        this.sendicecandidate = function (destination, payload) {
            console.info("sending icecandidate to " + destination);
            self.send("icecandidate", destination, payload);
        };
    })(this.username);
    var errorFn = function(e) {
        console.error(e);
    };
    var connect = function (destination) {
        destination = destination || "unknown";
        self.peerUsername = destination;
        self.peerConnection = new RTCPeerConnection(servers, {});
        self.dataChannel = self.peerConnection.createDataChannel("myDataChannel", {});

        self.peerConnection.onicecandidate = function (e) {
            if (!e.candidate) return;
            var candidate = new RTCIceCandidate(e.candidate);
            websocket.sendicecandidate(destination, e.candidate);
        };
        self.dataChannel.onopen = function (e) {
            self.onpeerconnection(self);
        };
        self.peerConnection.createOffer(
            function (offer) {
                self.peerConnection.setLocalDescription(offer);
                websocket.sendoffer(destination, offer);
            },
            errorFn
        );
    };
    var handleicecandidate = function (icecandidate, source) {
        console.info("received icecandidate from " + source);
        self.peerConnection.addIceCandidate(icecandidate);
    }
    var handleanswer = function (answer, source) {
        self.peerUsername = source;
        console.info("received answer from " + source);
        self.peerConnection.setRemoteDescription(answer);
    };
    var handleoffer = function (offer, source) {
        console.info("received offer from " + source);
        self.peerUsername = source;
        var source = source;
        self.peerConnection = new RTCPeerConnection(servers, {});
        self.peerConnection.setRemoteDescription(offer);
        self.peerConnection.createAnswer(
            function (answer) {
                self.peerConnection.setLocalDescription(answer);
                websocket.sendanswer(source, answer);
            },
            errorFn
        );
        self.peerConnection.onicecandidate = function (e) {
            if (!e.candidate) return;
            var candidate = new RTCIceCandidate(e.candidate);
            websocket.sendicecandidate(source, e.candidate);
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
                    _source: self.username,
                    _payload: payload
                };
                socket.emit("broadcast", JSON.stringify(message));
            };
        });
        socket.on("joined", function (numerOfUsersOnline) {
            if (numerOfUsersOnline > 1) {
                console.clear();
                console.info( (numerOfUsersOnline-1) + " other user(s) online. Connecting ...");
                connect();
            } else {
                console.clear();
                console.info("Waiting for others to come online");
            }
        });
        socket.on("broadcast", function (e) {
            var data = JSON.parse(e);

            if (data._type === "offer") {
                var offer = new RTCSessionDescription(data._payload);
                handleoffer(offer, data._source);
            }
            else if (data._type === "answer" && self.peerConnection) {
                var answer = new RTCSessionDescription(data._payload);
                handleanswer(answer, data._source);
            }
            else if (data._type === "icecandidate" && self.peerConnection) {
                var candidate = new RTCIceCandidate(data._payload);
                handleicecandidate(candidate, data._source);
            }
            else {
                console.error("received uncaught broadcast", data);
            }
        });
    };
    tryConnect();
}
