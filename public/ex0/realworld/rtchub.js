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


    var websocket = io.connect("");
    websocket.on("connect", function () {
        // fires when websocket connection is ready
        onReady();
    });
    websocket.on("broadcast", function (dto) {
        var message = JSON.parse(dto);
        var source = message._source
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

    var handleOffer = function (from, remoteDescription) {

        var peerConnection = new RTCPeerConnection(servers);
        peerConnection.ondatachannel = function (e) {
            onConnectionCallback(e.channel);
        }
        /*
         * TODO:
         * - Find a local and remote description for the RTCPeerConnection
         * - Send the answer and IceCandidates using the sendSignal function
         */
    }
    var handleAnswer = function (from, remoteDescription) {
        /*
         * TODO:
         * - Set the remoteDescription of the correct RTCPeerConnection
         */
    }
    var handleIceCandidate = function (from, iceCandidate) {
        /*
         * TODO:
         * - Add the IceCandidate to the correct RTCPeerConnection
         */
    }

    this.establishConnection = function(destination) {
        var peerConnection = new RTCPeerConnection(servers);
        var dataChannel = peerConnection.createDataChannel("to:" + destination, {});
        dataChannel.onopen = function (e) {
            onConnectionCallback(dataChannel);
        }
        /*
         * TODO:
         * - Create an offer set the local description of the RTCPeerConnection
         * - Send the offer and IceCandidates using the sendSignal function
         */
    }
};

