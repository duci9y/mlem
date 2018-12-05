var SIDE = 600

class Controller {

    constructor() {
        this.fixedCanvas = document.getElementById('fixed')
        this.updatesCanvas = document.getElementById('updates')

        this.ctx = this.fixedCanvas.getContext('2d')
        this.drawingCtx = this.updatesCanvas.getContext('2d')

        this.ctx.lineWidth = 10
        this.drawingCtx.lineWidth = 10

        this.ctx.lineJoin = this.ctx.lineCap = 'round'
        this.drawingCtx.lineJoin = this.drawingCtx.lineCap = 'round'

        this.currX = 0
        this.currY = 0

        this.mouseHeld = false
        this.batcher = 0



        this.socket = io.connect('//' + document.domain + ':' + location.port)
        this.socket.binaryType = 'blob'

        this.isDrawing, this.points = [ ]

        this.setupSocketHandlers()
        this.setupCanvasHandlers()

        var img = new Image()
        img.onload = function () {
            this.ctx.drawImage(img, 0, 0)
        }.bind(this)
        img.src = window.location.href + '/canvas.png'
    }

    setupSocketHandlers() {
        this.socket.on('connect', function() {
            console.log('Websocket connected!')
            let parts = window.location.href.split('/')
            this.socket.emit('join', { room: parts.pop() || parts.pop() })
        }.bind(this))

        this.socket.on('c', this.canvasUpdate.bind(this))
    }

    setupCanvasHandlers() {
        this.updatesCanvas.onmousedown = this.mouseDown.bind(this)
        this.updatesCanvas.onmousemove = this.mouseMove.bind(this)
        this.updatesCanvas.onmouseup = this.mouseUp.bind(this)
        this.updatesCanvas.onmouseout = this.mouseUp.bind(this)
    }

    canvasUpdate(data) {
        var img = new Image()

        img.onload = function () {
            this.ctx.drawImage(img, 0, 0)
        }.bind(this)

        img.src = data
    }

    midPointBtw(p1, p2) {
      return {
        x: p1.x + (p2.x - p1.x) / 2,
        y: p1.y + (p2.y - p1.y) / 2
      };
    }

    mouseDown(e) {
        this.currX = e.clientX - this.updatesCanvas.offsetLeft + $(document).scrollLeft()
        this.currY = e.clientY - this.updatesCanvas.offsetTop + $(document).scrollTop()
        // this.mouseHeld = true

        // this.ctx.beginPath()
        // this.ctx.moveTo(this.currX, this.currY)
        // this.drawingCtx.beginPath()
        // this.drawingCtx.moveTo(this.currX, this.currY)

        this.isDrawing = true;
        this.points.push({ x: this.currX, y: this.currY });
    }

    mouseMove(e) {
        if (!this.isDrawing) return;

        this.currX = e.clientX - this.updatesCanvas.offsetLeft + $(document).scrollLeft()
        this.currY = e.clientY - this.updatesCanvas.offsetTop + $(document).scrollTop()
  
        this.points.push({ x: this.currX, y: this.currY });
          
        var p1 = this.points[0];
        var p2 = this.points[1];
          
        this.ctx.beginPath()
        this.ctx.moveTo(p1.x, p1.y)
        this.drawingCtx.beginPath()
        this.drawingCtx.moveTo(p1.x, p1.y)

        console.log(this.points);

        for (var i = 1, len = this.points.length; i < len; i++) {
            // we pick the point between pi+1 & pi+2 as the
            // end point and p1 as our control point
            var midPoint = this.midPointBtw(p1, p2);
            this.ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
            this.drawingCtx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
            p1 = this.points[i];
            p2 = this.points[i+1];
        }
        // Draw last line as a straight line while
        // we wait for the next point to be able to calculate
        // the bezier control point
        this.ctx.lineTo(p1.x, p1.y)
        this.ctx.stroke()

        this.drawingCtx.lineTo(p1.x, p1.y)

        this.sendUpdates()
    }

    mouseUp(e) {
        this.isDrawing = false;
        this.points.length = 0;

        this.sendUpdates()
    }

    setColor(newColor) {
        this.ctx.fillStyle = newColor
        this.ctx.strokeStyle = newColor

        this.drawingCtx.fillStyle = newColor
        this.drawingCtx.strokeStyle = newColor
    }

    sendUpdates() {
        this.drawingCtx.stroke()

        this.socket.emit('d', this.updatesCanvas.toDataURL('image/png'))

        this.drawingCtx.clearRect(0, 0, SIDE, SIDE)

        // reset path too because stroking it will just restore it after
        // previous clear
        this.drawingCtx.beginPath()
        this.drawingCtx.moveTo(this.currX, this.currY)
        this.ctx.beginPath()
        this.ctx.moveTo(this.currX, this.currY)
    }

    reset() {
        console.log("resetting")

        this.drawingCtx.fillStyle= "#FFFFFF";
        this.drawingCtx.fillRect(0,0,SIDE,SIDE);

        this.socket.emit('d', this.updatesCanvas.toDataURL('image/png'))
        this.drawingCtx.clearRect(0, 0, SIDE, SIDE);
    }

    downloadImage() {
        var imgURL = this.fixedCanvas
            .toDataURL("image/png")
        //   .replace("image/png", "image/octet-stream")
        var dlink = document.getElementById("dlink")
        dlink.href = imgURL;
        dlink.setAttribute("download", "image.png")

    }


}

var ctrl = new Controller()
