var app = (function () {

    var video, canvas, context, frameTimer, pre;


    var errorCallback = function (e) {
        console.error("Something went wrong", e);
    }

    var startCapture = function (options) {
        frameTimer = setInterval(function () {
            context.drawImage(video, 0, 0, video.width, video.height)
            window.ascii.fromCanvas(canvas, {
                callback: function (asciiString) {
                    options.callback(asciiString)
                }
            });
        }, Math.round(1000 / options.fps));
    }

    var initCanvas = function (options) {
        pre = document.querySelector("pre");
        canvas = document.querySelector("canvas");
        canvas.setAttribute("width", video.width);
        canvas.setAttribute("height", video.height);

        context = canvas.getContext("2d");
        startCapture(options);
    }

    var initVideo = function (options) {
        navigator.getUserMedia({ video: true, audio: false },
            function (localMediaStream) {
                video = document.querySelector("video");
                video.src = window.URL.createObjectURL(localMediaStream);
                video.onloadedmetadata = function(e) {
                    video.width = this.videoWidth * options.scale;
                    video.height = this.videoHeight * options.scale;
                    initCanvas(options)
                };
            },
            errorCallback
        )
    }

    initVideo();

    return {
        run: function (args) {
            var options = {
                callback: args.callback || function () {},
                scale: args.scale || 0.2,
                fps: args.fps || 10
            }
            return initVideo(options);
        }
    }
})();
