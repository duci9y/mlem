var SIDE = 600

class Controller {

    constructor() {
        this.fixedCanvas = document.getElementById('fixed')
        this.updatesCanvas = document.getElementById('updates')

        this.ctx = this.fixedCanvas.getContext('2d')
        this.drawingCtx = this.updatesCanvas.getContext('2d')

        this.ctx.lineWidth = 2
        this.drawingCtx.lineWidth = 2

        this.currX = 0
        this.currY = 0
        this.prevX = 0
        this.prevY = 0

        this.mouseHeld = false

        this.socket = io.connect('//' + document.domain + ':' + location.port)
        this.socket.binaryType = 'blob';

        this.setupSocketHandlers()
        this.setupCanvasHandlers()

        var img = new Image();
        img.onload = function () {
            this.ctx.drawImage(img, 0, 0);
        }.bind(this)
        img.src = "/canvas.png";
    }

    setupSocketHandlers() {
        this.socket.on('connect', function() {
            console.log('Websocket connected!')
        })

        this.socket.on('canvas update', this.canvasUpdate.bind(this))
    }

    setupCanvasHandlers() {
        this.updatesCanvas.onmousedown = this.mouseDown.bind(this)
        this.updatesCanvas.onmousemove = this.mouseMove.bind(this)
        this.updatesCanvas.onmouseup = this.mouseUp.bind(this)
        this.updatesCanvas.onmouseout = this.mouseUp.bind(this)
    }

    canvasUpdate(data) {
        var buffer = new Uint16Array(data);

        var poppedColor = this.ctx.fillStyle
        this.ctx.fillStyle = 'rgb(' + buffer[2] + ',' + buffer[3] + ',' + buffer[4] + ')'
        this.ctx.fillRect(buffer[0], buffer[1], 1, 1)
        this.ctx.fillStyle = poppedColor
    }

    mouseDown(e) {
        this.currX = e.clientX - this.updatesCanvas.offsetLeft
        this.currY = e.clientY - this.updatesCanvas.offsetTop
        this.mouseHeld = true

        this.prevX = this.currX
        this.prevY = this.currY
        this.ctx.beginPath()
        this.ctx.moveTo(this.prevX, this.prevY)
        this.drawingCtx.beginPath()
        this.drawingCtx.moveTo(this.prevX, this.prevY)
    }

    mouseMove(e) {
        if (!this.mouseHeld) { return }

        this.currX = e.clientX - this.updatesCanvas.offsetLeft
        this.currY = e.clientY - this.updatesCanvas.offsetTop

        this.ctx.lineTo(this.currX, this.currY)
        this.ctx.stroke()
        this.drawingCtx.lineTo(this.currX, this.currY)
        // stroke only one canvas, stroke the other on mouseup
        // this.drawingCtx.stroke()
    }

    mouseUp(e) {
        if (!this.mouseHeld) { return }
        this.mouseHeld = false

        this.drawingCtx.stroke()

        let imageData = this.drawingCtx.getImageData(0, 0, SIDE, SIDE)

        let data = imageData.data

        for (var y = 0; y < imageData.height; y++) {
            for (var x = 0; x < imageData.width; x++) {
                // R x, R y
                let z = (y * imageData.width) + (x % imageData.width)
                let r = z * 4

                if (!(data.slice(r, r + 4).every(el => { return el == 0 }))) {
                    var buffer = new ArrayBuffer(10);
                    var bufView = new Uint16Array(buffer);
                    bufView[0] = x;
                    bufView[1] = y;
                    bufView[2] = data[r];
                    bufView[3] = data[r + 1];
                    bufView[4] = data[r + 2];
                    // var x_view = new Uint32Array(buffer, 0, 8);
                    // var y_view = new Uint32Array(buffer, 2, 8);
                    // var r_view = new Uint16Array(buffer, 4, 4);
                    // var g_view = new Uint16Array(buffer, 5, 4);
                    // var b_view = new Uint16Array(buffer, 6, 4);
                    //
                    // x_view = x;
                    // y_view = y;
                    // r_view = r;
                    // g_view = g;
                    // b_view = b;


                    this.socket.emit('draw', buffer);

                    // this.socket.emit('draw', {
                    //     pixel: [x, y],
                    //     color: [data[r], data[r + 1], data[r + 2]]
                    // })
                }
            }
        }

        this.drawingCtx.clearRect(0, 0, SIDE, SIDE)
    }

    setColor(newColor) {
        this.ctx.fillStyle = newColor
        this.ctx.strokeStyle = newColor

        this.drawingCtx.fillStyle = newColor
        this.drawingCtx.strokeStyle = newColor
    }
}

var ctrl = new Controller()
