var InputStream = (function (container) {
    var self = this;
    var container = container;
    this.read = function () {
        return container.value;
    }
    this.clear = function () {
        container.value = "";
    }
});

var OutputStream = (function (container) {
    var self = this;
    var container = container;
    this.loglevel = 0;

    this.setloglevel = function (level) {
        if (level === "info") self.loglevel = 2;
        else if (level === "warn") self.loglevel = 1;
        else self.loglevel = 0;
    }

    this.print = function (text) {
        var text = document.createTextNode(text);
        container.appendChild(text);
        self.scroll_down();
    }

    this.println = function (text) {
        var text = document.createTextNode(text + "\n");
        container.appendChild(text);
        self.scroll_down();
    }

    this.error = function (text) {
        var icon = document.createElement("span");
        icon.classList.add("fa");
        icon.classList.add("fa-times-circle");
        var text = document.createTextNode(text + "\n");
        var span = document.createElement("span");
        span.classList.add("error");
        span.appendChild(icon);
        span.appendChild(text);
        container.appendChild(span);
        self.scroll_down();
    }

    this.warn = function (text) {
        if (self.loglevel < 1) return;
        var icon = document.createElement("span");
        icon.classList.add("fa");
        icon.classList.add("fa-exclamation-triangle");
        var text = document.createTextNode(text + "\n");
        var span = document.createElement("span");
        span.classList.add("warning");
        span.appendChild(icon);
        span.appendChild(text);
        container.appendChild(span);
        self.scroll_down();
    }
    this.info = function (text)
    {
        if (self.loglevel < 2) return;
        var icon = document.createElement("span");
        icon.classList.add("fa");
        icon.classList.add("fa-info-circle");
        var text = document.createTextNode(text + "\n");
        var span = document.createElement("span");
        span.classList.add("info");
        span.appendChild(icon);
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



    this.matrixRender = function (prefix, text) {
        var icon = document.createElement("span");
        icon.classList.add("fa");
        icon.classList.add("fa-user");
        var textElement = document.createTextNode(prefix);
        var prefixElement = document.createElement("span");
        prefixElement.appendChild(icon);
        prefixElement.appendChild(textElement);
        container.appendChild(prefixElement);

        var element = document.createElement("span");
        container.appendChild(element);
        container.appendChild(document.createTextNode("\n"));
        self.scroll_down();

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
});



var stdin = new InputStream(document.getElementById("stdin"));
var stdout = new OutputStream(document.getElementById("stdout"));
var container = document.getElementById("stdout");
