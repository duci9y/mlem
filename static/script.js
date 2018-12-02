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

        this.mouseHeld = false
        this.batcher = 0

        this.socket = io.connect('//' + document.domain + ':' + location.port)
        this.socket.binaryType = 'blob'

        this.setupSocketHandlers()
        this.setupCanvasHandlers()

        var img = new Image()
        img.onload = function () {
            this.ctx.drawImage(img, 0, 0)
        }.bind(this)
        img.src = "/canvas.png"
    }

    setupSocketHandlers() {
        this.socket.on('connect', function() {
            console.log('Websocket connected!')
        })

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

    mouseDown(e) {
        this.currX = e.clientX - this.updatesCanvas.offsetLeft
        this.currY = e.clientY - this.updatesCanvas.offsetTop
        this.mouseHeld = true

        this.ctx.beginPath()
        this.ctx.moveTo(this.currX, this.currY)
        this.drawingCtx.beginPath()
        this.drawingCtx.moveTo(this.currX, this.currY)
    }

    mouseMove(e) {
        if (!this.mouseHeld) { return }

        this.batcher++

        this.currX = e.clientX - this.updatesCanvas.offsetLeft
        this.currY = e.clientY - this.updatesCanvas.offsetTop

        this.ctx.lineTo(this.currX, this.currY)
        this.ctx.stroke()
        this.drawingCtx.lineTo(this.currX, this.currY)
        // stroke only one canvas, stroke the other on mouseup
        // this.drawingCtx.stroke()

        if (this.batcher < 25) { return }

        this.batcher = 0

        this.sendUpdates()
    }

    mouseUp(e) {
        if (!this.mouseHeld) { return }
        this.mouseHeld = false

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
}

var ctrl = new Controller()
