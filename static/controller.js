let SIDE = 600

class Controller {

    constructor() {
        // initialize two canvases stacked on top of each other
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

        this.points = []

        this.socket = io.connect('//' + document.domain + ':' + location.port)
        this.socket.binaryType = 'blob'

        this.setupSocketHandlers()
        this.setupCanvasHandlers()

        // load and display current status of the canvas
        let img = new Image()
        img.onload = function() {
            this.ctx.drawImage(img, 0, 0)
        }.bind(this)
        img.src = window.location.href + '/canvas.png'
    }

    setupSocketHandlers() {
        this.socket.on('connect', function() {
            let parts = window.location.href.split('/')
            this.socket.emit('join', { room: parts.pop() || parts.pop() })
        }.bind(this))

        this.socket.on('c', this.canvasUpdate.bind(this))
    }

    setupCanvasHandlers() {
        this.updatesCanvas.onmousedown = this.mouseDown.bind(this)
        this.updatesCanvas.onmousemove = this.mouseMove.bind(this)
        this.updatesCanvas.onmouseup = this.penUp.bind(this)
        this.updatesCanvas.onmouseout = this.penUp.bind(this)

        this.updatesCanvas.ontouchstart = this.touchStart.bind(this)
        this.updatesCanvas.ontouchmove = this.touchMove.bind(this)
        this.updatesCanvas.ontouchend = this.penUp.bind(this)
        this.updatesCanvas.ontouchout = this.penUp.bind(this)
    }

    canvasUpdate(data) {
        let img = new Image()

        img.onload = function() {
            this.ctx.drawImage(img, 0, 0)
        }.bind(this)

        img.src = data
    }

    touchStart(e) {
        e.preventDefault()

        this.currX = e.touches[0].clientX - this.updatesCanvas.offsetLeft
        + $(document).scrollLeft()
        this.currY = e.touches[0].clientY - this.updatesCanvas.offsetTop
        + $(document).scrollTop()

        this.penDown()
    }

    mouseDown(e) {
        this.currX = e.clientX - this.updatesCanvas.offsetLeft
        + $(document).scrollLeft()
        this.currY = e.clientY - this.updatesCanvas.offsetTop
        + $(document).scrollTop()

        this.penDown()
    }

    touchMove(e) {
        e.preventDefault()

        if (!this.mouseHeld) { return }

        this.currX = e.touches[0].clientX - this.updatesCanvas.offsetLeft
        + $(document).scrollLeft()
        this.currY = e.touches[0].clientY - this.updatesCanvas.offsetTop
        + $(document).scrollTop()

        this.penMove()
    }

    mouseMove(e) {
        if (!this.mouseHeld) { return }

        this.currX = e.clientX - this.updatesCanvas.offsetLeft
        + $(document).scrollLeft()
        this.currY = e.clientY - this.updatesCanvas.offsetTop
        + $(document).scrollTop()

        this.penMove()
    }

    penDown() {
        this.mouseHeld = true

        this.drawingCtx.beginPath()
        this.drawingCtx.moveTo(this.currX, this.currY)

        this.points.push({ x: this.currX, y: this.currY })
    }

    penMove() {
        this.batcher++

        this.drawingCtx.lineTo(this.currX, this.currY)
        this.drawingCtx.stroke()

        this.points.push({ x: this.currX, y: this.currY })

        if (this.batcher < 25) { return }

        this.batcher = 0

        this.sendUpdates()
    }

    penUp(e) {
        e.preventDefault()

        if (!this.mouseHeld) { return }
        this.mouseHeld = false

        this.sendUpdates()

        this.points.length = 0
    }

    setColor(newColor) {
        this.ctx.fillStyle = newColor
        this.ctx.strokeStyle = newColor

        this.drawingCtx.fillStyle = newColor
        this.drawingCtx.strokeStyle = newColor
    }

    sendUpdates() {
        if (this.points.length > 1) {
            this.drawingCtx.beginPath()
            this.ctx.beginPath()

            this.drawingCtx.moveTo(this.points[0].x, this.points[0].y)
            this.ctx.moveTo(this.points[0].x, this.points[0].y)

            for (const point of this.points.slice(1)) {
                this.drawingCtx.lineTo(point.x, point.y)
                this.ctx.lineTo(point.x, point.y)
            }

            this.points = this.points.slice(this.points.length - 1)

            this.drawingCtx.clearRect(0, 0, SIDE, SIDE)

            this.drawingCtx.stroke()
            this.ctx.stroke()
        }

        this.canvasUpdate(this.updatesCanvas.toDataURL('image/png'))

        this.socket.emit('d', this.updatesCanvas.toDataURL('image/png'))

        this.drawingCtx.clearRect(0, 0, SIDE, SIDE)

        // reset path too because stroking it will just restore it after
        // previous clear
        this.drawingCtx.beginPath()
        this.drawingCtx.moveTo(this.currX, this.currY)
    }

    reset() {
        this.drawingCtx.fillStyle = '#FFFFFF'
        this.drawingCtx.fillRect(0, 0, SIDE, SIDE)

        this.sendUpdates()

        this.drawingCtx.clearRect(0, 0, SIDE, SIDE)
    }

    downloadImage() {
        var dlink = document.getElementById('dlink')
        dlink.href = this.fixedCanvas.toDataURL('image/png')
        dlink.setAttribute('download', 'image.png')
    }
}

var ctrl = new Controller()
