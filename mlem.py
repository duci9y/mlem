from flask import Flask, render_template, Response, abort, jsonify
import flask_socketio
from flask_socketio import SocketIO, join_room, emit, send
from canvas import Canvas
from eventlet.green import threading
from hashids import Hashids
import os
import logging
import struct

# logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
socketio = SocketIO(app)
# socketio = SocketIO(app, logger=True, engineio_logger=True)
canvas = Canvas()
lock = threading.Lock()

# rooms = {
#     'ag84h': (canvas, lock,)
# }

hashids = Hashids(salt='when the full moon shines, i eat cucumber',
                  min_length=6,
                  alphabet='abcdefghijklmnopqrstuvwxyz1234567890')
rooms = {}
room_lock = threading.Lock()
room_counter = 0

@app.route('/')
def index():
    # TODO: create room interface
    return render_template('create.html')


@app.route('/canvas', methods=['POST'])
def create_canvas():
    canvas = Canvas()
    lock = threading.Lock()

    global room_counter

    with room_lock:
        room_id = hashids.encode(room_counter)
        rooms[room_id] = (canvas, lock)
        room_counter += 1

        return jsonify({ 'room': room_id })


@app.route('/canvas/<string:room>')
def get_canvas(room):
    if room not in rooms:
        #TODO: design better error page
        return abort(404)
    else:
        return render_template('paint.html')


@app.route('/canvas/<string:room>/canvas.png')
def raw_canvas_data(room):
    if room not in rooms:
        return abort(404)
    else:
        canvas, lock = rooms[room]

        with lock:
            return Response(canvas.raw_png(), mimetype='image/png')


@socketio.on('d')
def draw_on_canvas(data):
    client_rooms = flask_socketio.rooms()

    room_id = None
    for room in client_rooms:
        if room not in rooms:
            continue
        room_id = room

    if not room_id:
        return emit('error', 'canvas not found')

    canvas, lock = rooms[room_id]

    with lock:
        canvas.load_updates(data)

    emit('c', data, broadcast=True, room=room_id, include_self=False)


@socketio.on('join')
def on_join(data):
    room_id = data['room']

    if room_id not in rooms:
        emit('error', {'error': 'Room does not exist' })
    else:
        join_room(room_id)
        send('success', room=room_id)
