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

    self.peers = {};

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
    var connectToPeer = function (peer) {
        var peer = peer;
        var peerConnection = new RTCPeerConnection(servers, {});
        var dataChannel = peerConnection.createDataChannel("myDataChannel", {})

        self.peers[peer] = {
            username: peer,
            peerConnection: peerConnection,
            dataChannel: dataChannel
        };
        peerConnection.createOffer(
            function (offer) {
                peerConnection.setLocalDescription(offer);
                websocket.sendoffer(peer, offer);
            },
            errorFn
        );
        peerConnection.onicecandidate = function (e) {
            if (!e.candidate) return;
            var candidate = new RTCIceCandidate(e.candidate);
            websocket.sendicecandidate(peer, e.candidate);
        };
        dataChannel.onopen = function (e) {
            self.onpeerconnection(self.peers[peer]);
        };
    };
    var handleicecandidate = function (icecandidate, source) {
        console.info("received icecandidate from " + source);
        var peerConnection = self.peers[source].peerConnection;
        peerConnection.addIceCandidate(icecandidate);
    }
    var handleanswer = function (answer, source) {
        console.info("received answer from " + source);
        var peerConnection = self.peers[source].peerConnection;
        peerConnection.setRemoteDescription(answer);
    };
    var handleoffer = function (offer, source) {
        console.info("received offer from " + source);
        var peer = source;
        var peerConnection = new RTCPeerConnection(servers, {});
        self.peers[peer] = {
            username: peer,
            peerConnection: peerConnection
        };
        peerConnection.setRemoteDescription(offer);
        peerConnection.createAnswer(
            function (answer) {
                peerConnection.setLocalDescription(answer);
                websocket.sendanswer(peer, answer);
            },
            errorFn
        );
        peerConnection.onicecandidate = function (e) {
            if (!e.candidate) return;
            var candidate = new RTCIceCandidate(e.candidate);
            websocket.sendicecandidate(peer, e.candidate);
        };
        peerConnection.ondatachannel = function (e) {
            self.peers[peer].dataChannel = e.channel;
            self.onpeerconnection(self.peers[peer]);
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
        // You joined the socket.io default room.
        // numberOfUsersOnline gives total number of connected clients
        socket.on("joined", function (numerOfUsersOnline) {
            if (numerOfUsersOnline > 1) {
                // Connect to user (only works for two online users ...)
                // console.clear();
                //connectToPeer();
                console.info((numerOfUsersOnline-1) + " other user(s) online.");
            } else {
                //console.clear();
                console.info("Waiting for others to come online");
            }
            socket.emit("hello", self.username);
        });

        // Someone else joined the socket.io default room
        // username is the username of the arriving client
        socket.on("hello", function (username) {
            console.warn("a user with username '" + username + "' joined the room");
            connectToPeer(username);
        });

        // Received broadcast from the default room with socket.io
        socket.on("broadcast", function (e) {
            var data = JSON.parse(e);
            // Ignore messages with other destination
            if (data._destination !== self.username) return;
            var peer = self.peers[data._source] || {};
            if (data._type === "offer") {
                var offer = new RTCSessionDescription(data._payload);
                handleoffer(offer, data._source);
            }
            else if (data._type === "answer" && peer.peerConnection) {
                var answer = new RTCSessionDescription(data._payload);
                handleanswer(answer, data._source);
            }
            else if (data._type === "icecandidate" && peer.peerConnection) {
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
