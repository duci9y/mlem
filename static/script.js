var canvas = document.getElementById("paint");
var ctx = canvas.getContext("2d");
var curX, curY, prevX, prevY;
var hold = false;
ctx.lineWidth = 2;
var canvas_data = { "pencil": [] }

var socket = io.connect('//' + document.domain + ':' + location.port);

// verify our websocket connection is established
socket.on('connect', function() {
    console.log('Websocket connected!');
});

socket.on('canvas update', function(data) {
    console.log(data);
    var poppedColor = ctx.fillStyle;
    ctx.fillStyle = 'rgb(' + data.color[0] + ',' + data.color[1] + ',' + data.color[2] + ')';
    ctx.fillRect(data.pixel[0], data.pixel[1], 1, 1);
    ctx.fillStyle = poppedColor;

});

// emit a message on the 'draw' channel to draw a random line on the canvas
function drawOnCanvas() {
    console.log('drawing line...');
    horizontal = Math.random() * 600
    vertical = Math.random() * 550
    for (var i = 0; i < 50; i++) {
        socket.emit('draw', { pixel: [horizontal, vertical + i], color: [255, 255, 255] });
    }
}


function color(color_value) {
    ctx.strokeStyle = color_value;
    ctx.fillStyle = color_value;
}

// pencil tool
function pencil() {

    canvas.onmousedown = function(e) {
        curX = e.clientX - canvas.offsetLeft;
        curY = e.clientY - canvas.offsetTop;
        hold = true;

        prevX = curX;
        prevY = curY;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
    };

    canvas.onmousemove = function(e) {
        if (hold) {
            curX = e.clientX - canvas.offsetLeft;
            curY = e.clientY - canvas.offsetTop;
            draw();

            socket.emit('draw', { pixel: [curX, curY], color: [127, 127, 127]});
        }
    };

    canvas.onmouseup = function(e) {
        hold = false;
    };

    canvas.onmouseout = function(e) {
        hold = false;
    };

    function draw() {
        ctx.lineTo(curX, curY);
        ctx.stroke();
        canvas_data.pencil.push({ "startx": prevX, "starty": prevY, "endx": curX, "endy": curY, "thick": ctx.lineWidth, "color": ctx.strokeStyle });
    }
}