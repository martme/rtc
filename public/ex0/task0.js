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

var alice = {};
var bob = {};

var celebrateVictory = function () {
    console.log("Connection established");
    console.log("$$$ Profit! $$$")
};

alice.peerConnection = new RTCPeerConnection(servers);
alice.dataChannel = alice.peerConnection.createDataChannel("myDataChannel");

bob.peerConnection = new RTCPeerConnection(servers, {});

alice.peerConnection.onicecandidate = function (e) {
    if (e.candidate) {
        var candidate = new RTCIceCandidate(e.candidate);
        // socket.io magic
        bob.peerConnection.addIceCandidate(candidate);
    }
}
bob.peerConnection.onicecandidate = function (e) {
    if (e.candidate) {
        var candidate = new RTCIceCandidate(e.candidate);
        // socket.io magic
        alice.peerConnection.addIceCandidate(candidate);
    }
}

alice.dataChannel.onopen = function (e) {
    // channel = alice.dataChannel
}

bob.peerConnection.ondatachannel = function (e) {
    bob.dataChannel = e.channel;
    // channel = bob.dataChannel
    celebrateVictory();

    bob.dataChannel.onmessage = function (e){
        console.log(e.data, e);
        var buffer = e.data;
        console.log(buffer.byteLength);
    }

    var data = new Uint8Array([0, 1, 2, 3, 4, 5]);
    alice.dataChannel.send(data);
}

alice.peerConnection.createOffer(
    function (offer) {
        alice.peerConnection.setLocalDescription(offer);
        // litt socketio her ...
        bob.peerConnection.setRemoteDescription(offer);
        bob.peerConnection.createAnswer(
            function (answer) {
                bob.peerConnection.setLocalDescription(answer);
                // socketio magic
                alice.peerConnection.setRemoteDescription(answer);
            },
            function (error) {}
        );

    },
    function (error) {}
);


















