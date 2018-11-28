from flask import Flask, render_template
from flask_socketio import SocketIO, join_room, emit
from canvas import Canvas
import sys

app = Flask(__name__)
socketio = SocketIO(app, engineio_logger=True)
canvas = Canvas()

# @app.route("/")
# def index():
#     return render_template('index.html', img_data=canvas.embed())

@app.route("/")
def index():
    return render_template('paint.html')

@socketio.on('draw')
def draw_on_canvas(data):
    canvas.draw_pixel(data['pixel'], data['color'])
