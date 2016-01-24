const ConnectionStatus = {
    ONLINE: { displaytext: "online", labelclass: "label label-success" },
    CONNECTING: { displaytext: "connecting", labelclass: "label label-warning" },
    OFFLINE: { displaytext: "offline", labelclass: "label label-danger" }
};

const MessageStatus = {
    UNREAD: "unread",
    READ: "read"
};

var ChatClient = function (username) {
    var self = this;


    this.username = username;
    this.contact = ko.observable(new Contact());
    this.contacts = ko.observableArray([
    ]);
    this.rtchub = new WebRTCHub(username, function (username, datachannel) {

        datachannel.onclose = function () {
            self.contacts().filter(x => x.username === username)[0].status(ConnectionStatus.OFFLINE);
        }
        var contact = self.contacts().filter(x => x.username === username)[0];
        if (contact) {
            contact.datachannel = datachannel;
            contact.status(ConnectionStatus.ONLINE);
        } else {
            contact = new Contact(username, datachannel, ConnectionStatus.ONLINE);
            self.contacts.push(contact);
        }
        contact.initializeDataChannel();
        if (self.contacts().length === 1) self.selectContact(self.contacts()[0]);
    });

    this.sendMessage = function () {
        var input = document.querySelector("input#messageinput");
        var message = input.value;
        input.value = "";
        //self.contact().messages.push(new Message(self.username, message, false, MessageStatus.READ));
        self.contact().sendMessage(message);
    }

    this.receiveMessage = function (username, message) {

    }

    document.querySelector("input#messageinput").onkeypress = function (e) {
        if (e.keyCode === 13) self.sendMessage();
    };

    this.selectContact = function (contact) {
        self.contacts().filter(x => x.username !== contact.username).forEach(x => x.iscurrent(false));
        contact.iscurrent(true);
        contact.messages().forEach(x => x.status(MessageStatus.READ));
        self.contact(contact);
    }
}

var Contact = function (username, datachannel, status) {
    var self = this;
    this.datachannel = datachannel;
    this.username = username;
    this.status = ko.observable(status || ConnectionStatus.OFFLINE);
    this.messages = ko.observableArray([]);
    this.iscurrent = ko.observable(false);
    this.unread = ko.computed(function () {
        return self.messages().filter(x => x.status() === MessageStatus.UNREAD).length;
    });

    this.initializeDataChannel = function () {
        self.sendMessage = function (message) {
            self.messages.push(new Message(self.username, message, false, MessageStatus.READ));
            self.datachannel.send(JSON.stringify({ from: self.username, message: message }));
        };
        self.datachannel.onmessage = function (e) {
            var msg = JSON.parse(e.data);
            var messageStatus = self.iscurrent() ? MessageStatus.READ : MessageStatus.UNREAD;
            self.messages.push(new Message(msg.from, msg.message, true, messageStatus));
        }
    }
}

var Message = function (sender, text, received, status) {
    this.text = text;
    this.sender = sender;
    this.messagetype = received ? "message message-received" : "message message-sent";
    this.status = ko.observable(status || MessageStatus.UNREAD);
}
