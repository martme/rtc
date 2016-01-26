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

alice.peerConnection.createOffer(
    function (alicesOffer) {
        alice.peerConnection.setLocalDescription(alicesOffer);
        // på magisk vis blir denne også sent til Bob!
        bob.peerConnection.setRemoteDescription(alicesOffer);

        bob.peerConnection.createAnswer(
            function (bobsAnswer) {
                bob.peerConnection.setLocalDescription(bobsAnswer);
                // på magisk vis sendes dette tilbake til Alice!
                alice.peerConnection.setRemoteDescription(bobsAnswer);
            },
            function (error) {
            })
    },
    function (error) {

    });



alice.peerConnection.onicecandidate = function (e) {
    if (e.candidate) {
        bob.peerConnection.addIceCandidate(e.candidate);
    }
}
bob.peerConnection.onicecandidate = function (e) {
    if (e.candidate) {
        alice.peerConnection.addIceCandidate(e.candidate);
    }
}

alice.dataChannel.onopen = function (e) {

    alice.dataChannel.onmessage = function (e) {
        console.log("alice received message:", e.data);
    }
}

bob.peerConnection.ondatachannel = function (e) {
    bob.dataChannel = e.channel;
    celebrateVictory();

    bob.dataChannel.send("Hello, world!");
}


















