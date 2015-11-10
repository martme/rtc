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
var errorFn = function (error) {
    console.error(error)
};

alice.peerConnection = new RTCPeerConnection(servers, {});
alice.dataChannel = alice.peerConnection.createDataChannel("unique id", {});

bob.peerConnection = new RTCPeerConnection(servers, {});

alice.peerConnection.onicecandidate = function (e) {
    if (e.candidate) {
        var candidate = new RTCIceCandidate(e.candidate);
        bob.peerConnection.addIceCandidate(e.candidate);
    }
}
bob.peerConnection.onicecandidate = function (e) {
    if (e.candidate) {
        var candidate = new RTCIceCandidate(e.candidate);
        alice.peerConnection.addIceCandidate(e.candidate);
    }
}

alice.dataChannel.onopen = function (e) {
    console.log("Alice's data channel is open", e.target);
    alice.dataChannel.onmessage = function (e) {
        console.log("[to:alice]\t", e.data);
    }
}

bob.peerConnection.ondatachannel = function (e) {
    console.log("Bob's data channel is open", e.channel);
    bob.dataChannel = e.channel;
    bob.dataChannel.onmessage = function (e) {
        console.log("[to:bob]\t", e.data);
    }
}

alice.peerConnection.createOffer(
    function (offer) {
        alice.peerConnection.setLocalDescription(offer);
        bob.peerConnection.setRemoteDescription(offer);
        bob.peerConnection.createAnswer(
            function (answer) {
                bob.peerConnection.setLocalDescription(answer);
                alice.peerConnection.setRemoteDescription(answer);
            },
            errorFn
        );
    },
    errorFn
);
