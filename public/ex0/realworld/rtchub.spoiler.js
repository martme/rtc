var servers = {
    iceServers: [
        {url:'stun:stun.l.google.com:19302'},
        {url:'stun:stun1.l.google.com:19302'},
        {url:'stun:stun2.l.google.com:19302'},
        {url:'stun:stun3.l.google.com:19302'},
        {url:'stun:stun4.l.google.com:19302'}
    ]
};

var RTCHub = function (username, onReady, onConnectionCallback) {
    var username = username;
    var onReady = onReady || function () {};
    var onConnectionCallback = onConnectionCallback || function () {};
    var cache = {};

    var websocket = io.connect("");
    websocket.on("connect", function () {
        onReady();
    });
    websocket.on("broadcast", function (dto) {
        var message = JSON.parse(dto);
        var source = message._source
        // ignore messages with other destinations
        if (message._destination !== username) return;
        if (message.type == "offer") {
            var offer = new RTCSessionDescription(message);
            handleOffer(source, offer);
        } else if (message.type == "answer") {
            var answer = new RTCSessionDescription(message);
            handleAnswer(source, answer);
        }
        else {
            var iceCandidate = new RTCIceCandidate(message);
            handleIceCandidate(source, iceCandidate);
        }
    });
    var sendSignal = function (destination, payload) {
        var obj = JSON.parse(JSON.stringify(payload))
        obj["_destination"] = destination;
        obj["_source"] = username;
        websocket.emit("broadcast", JSON.stringify(obj));
    }

    this.establishConnection = function(destination) {
        var peerConnection = new RTCPeerConnection(servers);
        var dataChannel = peerConnection.createDataChannel("to:" + destination, {});

        peerConnection.createOffer(
            function (offer) {
                peerConnection.setLocalDescription(offer);
                sendSignal(destination, offer);
            },
            function (error) {
                console.error("Something went wrong", error);
            }
        );
        peerConnection.onicecandidate = function (e) {
            if (e.candidate) {
                sendSignal(destination, e.candidate);
            }
        }
        dataChannel.onopen = function (e) {
            onConnectionCallback(dataChannel);
        }
        cache[destination] = peerConnection;
    }

    var handleOffer = function (from, remoteDescription) {
        var peerConnection = new RTCPeerConnection(servers);
        peerConnection.setRemoteDescription(remoteDescription);
        peerConnection.createAnswer(
            function (localDescription) {
                peerConnection.setLocalDescription(localDescription);
                sendSignal(from, localDescription);

            },
            function (error) {
            });
        peerConnection.onicecandidate = function (e) {
            if (e.candidate) {
                sendSignal(from, e.candidate);
            }
        }
        peerConnection.ondatachannel = function (e) {
            onConnectionCallback(e.channel);
        }
        cache[from] = peerConnection;

    }
    var handleAnswer = function (from, remoteDescription) {
        cache[from].setRemoteDescription(remoteDescription);
    }
    var handleIceCandidate = function (from, iceCandidate) {
        cache[from].addIceCandidate(iceCandidate);
    }
};

