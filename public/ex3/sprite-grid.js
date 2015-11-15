'use strict'
var SpriteGrid = function (container) {
    const self = this;
    const SIZE = 16;
    const CONTAINER = container;

    var Direction = {
        UP: "up",
        DOWN: "down",
        LEFT: "left",
        RIGHT: "right",
        NONE: "none"
    }

    var Pixel = function (x, y, classList, direction) {
        var _this = this;
        x = x || 0;
        y = y || 0;
        classList = classList || [];
        direction = direction || Direction.NONE;


        this.element = document.createElement("div");
        classList.forEach(function (c) {
            _this.element.classList.add(c);
        });
        this.element.classList.add("sprite");

        this.setx(x);
        this.sety(y);
        this.setDirection(direction);

        this.element.addEventListener("animationiteration", function (e) {
            var direction = Direction.NONE;
            if (e.animationName === "moveRight") {
                direction = Direction.RIGHT;
                _this.setx(_this.getx() + 1);
            } else if (e.animationName === "moveLeft") {
                direction = Direction.LEFT;
                _this.setx(_this.getx() - 1);
            } else if (e.animationName === "moveUp") {
                direction = Direction.UP;
                _this.sety(_this.gety() - 1);
            } else if (e.animationName === "moveDown") {
                direction = Direction.DOWN;
                _this.sety(_this.gety() + 1);
            }
            _this.tick({
                direction: direction,
                pixel: _this,
                x: _this.getx(),
                y: _this.gety()
            });
        }, false);
        CONTAINER.appendChild(this.element);
        return this;
    };
    Pixel.prototype.getx = function() {
        return parseInt(this.element.getAttribute("data-position-x"));
    }
    Pixel.prototype.setx = function(x) {
        this.element.setAttribute("data-position-x", x);
    }
    Pixel.prototype.gety = function() {
        return parseInt(this.element.getAttribute("data-position-y"));
    }
    Pixel.prototype.sety = function(y) {
        this.element.setAttribute("data-position-y", y);
    }
    Pixel.prototype.collidesWith = function (other) {
        return this.getx() === other.getx() && this.gety() === other.gety();
    }
    Pixel.prototype.tick = function (event) {
    }
    Pixel.prototype.setDirection = function (d) {
        this.element.setAttribute("data-direction", d);
    }
    Pixel.prototype.getDirection = function (d) {
        return this.element.getAttribute("data-direction");
    }
    this.Pixel = Pixel;
    this.Direction = Direction;
    this.Size = function () { return SIZE };
};