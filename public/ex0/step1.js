"use strict"

// image taken from https://www.reddit.com/r/programming/comments/17ydqx/hello_chrome_firefox_meet_serverless_webrtc/c8adb5w

var binaryMessage = (function () {
    var message = "Hello, World!";
    var charcodeArray = message.split("").map(function (c) {
        return c.charCodeAt(0);
    });
    return new Uint8Array(charcodeArray);
})();

var encrypt = function (input) {
    return input.map(function (byteValue) {
        return (byteValue + 13) % 256;
    });
}

var decrypt = function (input) {
    return input.map(function (byteValue) {
        return (byteValue - 13) % 256;
    });
}

var toCharArray = function (input) {
    var output = [];
    input.forEach(function (byteValue) {
        output.push(String.fromCharCode(byteValue));
    });
    return output.join("");
}

var rtcChannelEstablished = function () {
    console.log("Connection established in step1");

    alice.dataChannel.onmessage = function (e) {
        console.log("hello world");
        if (Object.prototype.toString.call(e.data) === "[object ArrayBuffer]") {
            var buffer = new Uint8Array(e.data);
            console.log("[to:alice]", "[type:arrayBuffer]", toCharArray(buffer));
        }
    }
    bob.dataChannel.send(binaryMessage);
};



