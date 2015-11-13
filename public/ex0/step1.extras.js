'use strict'
var matrixRender = function (text, element) {
    var current = Array.apply(null, Array(text.length)).map(function () {
        var charCode = 32 + parseInt(Math.random() *  (124 - 32));
        return String.fromCharCode(charCode);
    }).join("");
    var target = text;
    var interval = setInterval(function () {
        if (current === target) {
            clearInterval(interval);
        } else {
            current = renderNext(current, target)
            console.log(current);
        }
    }, 5);
    function renderNext(current, target) {
        return current.split("").map(function (c, idx) {
            if (c === target[idx]) return c;
            var charCode = (c.charCodeAt(0) + 1) % 123;
            if (charCode <= 32) charCode = 32;

            return String.fromCharCode(charCode);
        }).join("");
    }
}
