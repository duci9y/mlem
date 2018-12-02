from PIL import Image, ImageDraw
from io import BytesIO
import base64
import re

class Canvas:
    def __init__(self, dimen=600):
        self.dimen = dimen
        self.canvas = Image.new('RGBA', (dimen, dimen), color=(255, 255, 255))
        self.data = self.canvas.load()

    def raw_png(self):
        img_io = BytesIO()
        self.canvas.save(img_io, 'PNG')
        img_io.seek(0)
        return img_io.read()

    # return image src to put in browser's image tag
    def embed(self):
        img_io = BytesIO()
        self.canvas.save(img_io, 'PNG', quality=70)
        img_io.seek(0)
        data_uri = base64.b64encode(img_io.read()).decode('utf-8').replace('\n', '')
        return "data:image/png;base64,{0}".format(data_uri)

    # update canvas
    def load_updates(self, data):
        base64data = data.split(',')[1]
        img_data = base64.b64decode(base64data)
        updates = Image.open(BytesIO(img_data))
        self.canvas = Image.alpha_composite(self.canvas, updates)

    # draw a single pixel
    def draw_pixel(self, pixel, color):
        x, y = pixel
        if self.valid_bounds(x, y):
            self.data[x, y] = color

    # check if given pixel indices are valid
    def valid_bounds(self, x, y):
        return x >= 0 and x < self.dimen and y >= 0 and y < self.dimen
