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
        // TODO: ???
    }
}
bob.peerConnection.onicecandidate = function (e) {
    if (e.candidate) {
        var candidate = new RTCIceCandidate(e.candidate);
        // TODO: ???
    }
}

alice.dataChannel.onopen = function (e) {
    // channel = alice.dataChannel
}

bob.peerConnection.ondatachannel = function (e) {
    bob.dataChannel = e.channel;
    // channel = bob.dataChannel
    celebrateVictory();
}

alice.peerConnection.createOffer(
    function (offer) {
        // TODO: ???
    },
    function (error) {}
);


