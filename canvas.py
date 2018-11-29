from PIL import Image
from StringIO import StringIO
import base64

class Canvas:
    def __init__(self, dimen=600):
        self.dimen = dimen
        self.canvas = Image.new('RGB', (dimen, dimen), color=(255, 255, 255))

    def raw_png(self):
        img_io = StringIO()
        self.canvas.save(img_io, 'PNG')
        img_io.seek(0)
        return img_io.read()

    # return image src to put in browser's image tag
    def embed(self):
        img_io = StringIO()
        self.canvas.save(img_io, 'JPEG', quality=70)
        img_io.seek(0)
        data_uri = base64.b64encode(img_io.read()).decode('utf-8').replace('\n', '')
        return "data:image/png;base64,{0}".format(data_uri)

    # draw a single pixel
    def draw_pixel(self, pixel, color):
        x, y = pixel
        if self.valid_bounds(x, y):
            self.canvas.load()[x, y] = color

    # check if given pixel indices are valid
    def valid_bounds(self, x, y):
        return x >= 0 and x < self.dimen and y >= 0 and y < self.dimen
