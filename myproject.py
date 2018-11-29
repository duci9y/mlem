from flask import Flask, render_template, Response
from flask_socketio import SocketIO, join_room, emit
from canvas import Canvas
from multiprocessing import Lock
import os
import logging

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
socketio = SocketIO(app, engineio_logger=True)
canvas = Canvas()
lock = Lock()

# @app.route("/")
# def index():
#     return render_template('index.html', img_data=canvas.embed())

@app.route("/")
def index():
    return render_template('paint.html')

@app.route("/canvas.png")
def raw_canvas_data():
    return Response(canvas.raw_png(), mimetype='image/png')

@socketio.on('draw')
def draw_on_canvas(data):
    with lock:
        logging.debug("{}'s lock: {}".format(os.getpid(), id(lock)))
        canvas.draw_pixel(data['pixel'], data['color'])

    emit('canvas update', data, broadcast=True)
