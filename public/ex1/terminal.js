var InputStream = (function (container) {
    var self = this;
    var container = container;
    var history = [];
    var history_offset = 0;


    this.read = function () {
        return container.value;
    }

    this.clear = function () {
        container.value = "";
    }

    this.add_to_history = function (cmd) {
        history.push(cmd);
        history_offset = history.length;
    }

    this.set_previous_from_history = function () {
        if (history.length === 0) return;
        history_offset = Math.max(0, history_offset-1);
        container.value = history[history_offset];
    }
    this.set_next_from_history = function () {
        if (history.length === 0) return;
        history_offset = Math.min(history.length, history_offset+1);
        if (history_offset === history.length) {
            container.value = "";
        } else {
            container.value = history[history_offset];
        }
    }

    this.history = function () {
        return history;
    }
});

var OutputStream = (function (container) {
    var self = this;
    var container = container;

    this.print = function (text) {
        var text = document.createTextNode(text);
        container.appendChild(text);
        self.scroll_down();
        return text;
    }

    this.printMatrix = function (text) {

    }


    this.println = function (text) {
        var text = document.createTextNode(text + "\n");
        container.appendChild(text);
        self.scroll_down();
        return text;
    }

    this.info = function (text)
    {
        var text = document.createTextNode(text + "\n");
        var span = document.createElement("span");
        span.classList.add("info");
        span.appendChild(text);
        container.appendChild(span);
        self.scroll_down();
    }

    this.err = function (text) {
        var text = document.createTextNode(text + "\n");
        var span = document.createElement("span");
        span.classList.add("error");
        span.appendChild(text);
        container.appendChild(span);
        self.scroll_down();
    }

    this.warn = function (text) {
        var text = document.createTextNode(text + "\n");
        var span = document.createElement("span");
        span.classList.add("warning");
        span.appendChild(text);
        container.appendChild(span);
        self.scroll_down();
    }
    this.scroll_down = function () {
        container.parentNode.scrollTop = container.parentNode.scrollHeight;
    }
    this.clear = function () {
        container.innerHTML = "";
    }
});


var matrixRender = function (text, element) {
    var current = Array.apply(null, Array(text.length)).map(function () {
        var charCode = 32 + parseInt(Math.random() *  (124 - 32));
        return String.fromCharCode(charCode);
    }).join("");
    var target = text;
    var iterations = 0;
    var interval = setInterval(function () {
        if (current === target) {
            clearInterval(interval);
        } else {
            current = renderNext(current, target);
            element.innerHTML = current;
        }
        if (++iterations > 124-32) {
            current = target;
            element.innerHTML = current;
        }
    }, 15);
    function renderNext(current, target) {
        return current.split("").map(function (c, idx) {
            if (c === target[idx]) return c;
            var charCode = (c.charCodeAt(0) + 1) % 123;
            if (charCode <= 32) charCode = 32;
            return String.fromCharCode(charCode);
        }).join("");
    }
}


var stdin = new InputStream(document.getElementById("stdin"));
var stdout = new OutputStream(document.getElementById("stdout"));
var container = document.getElementById("stdout");
