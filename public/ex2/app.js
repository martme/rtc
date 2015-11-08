
var App = function (socket) {
    var self = this;
    var socket = socket;

    this.jsepHelpers = {
        sendIceCandidate: function (e) {
        console.log("sending icecandidate", e)
            socket.emit("icecandidate", JSON.stringify(e));
        },
        sendOffer: function (e) {
        console.log("sending offer", e)
            socket.emit("offer", JSON.stringify(e));
        },
        sendAnswer: function (e) {
        console.log("sending answer", e)
            socket.emit("answer", JSON.stringify(e));
        }
    };

    var getRecievedMessageElement = function (text) {
        var li = document.createElement("li");
        li.classList.add("message-received");
        li.appendChild(document.createTextNode(text));
        return li;
    }
    var getSentMessageElement = function (text) {
        var li = document.createElement("li");
        li.classList.add("message-sent");
        li.appendChild(document.createTextNode(text));
        return li;
    }
    this.receivemessage = function (message) {
        var messageElement = getRecievedMessageElement(message.data);
        document.getElementById("messages").appendChild(messageElement);
    }

    document.getElementById("send-btn").onclick = function () {  
        var message = document.getElementById("message-input").value;
        var messageElement = getSentMessageElement(message);
        document.getElementById("messages").appendChild(messageElement);
        this.dispatchEvent(new CustomEvent("sendmessage", {
            detail: {
                message: message,
            },
            bubbles: true,
            cancelable: true
        }));
        document.getElementById("message-input").value = "";
    }
};