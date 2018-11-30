from flask import Flask, render_template, Response
from flask_socketio import SocketIO, join_room, emit
from canvas import Canvas
from eventlet.green import threading
import os
import logging
import struct

# logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
socketio = SocketIO(app)
# socketio = SocketIO(app, logger=True, engineio_logger=True)
canvas = Canvas()
lock = threading.Lock()

@app.route("/")
def index():
    return render_template('paint.html')

@app.route("/canvas.png")
def raw_canvas_data():
    return Response(canvas.raw_png(), mimetype='image/png')

@socketio.on('d')
def draw_on_canvas(data):
    emit('c', data, broadcast=True)
