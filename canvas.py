from PIL import Image, ImageDraw
from io import BytesIO
import base64
import re

class Canvas:
    def __init__(self, dimen=600):
        '''initialize the server's copy of the canvas'''
        self.dimen = dimen
        self.canvas = Image.new('RGBA', (dimen, dimen), color=(255, 255, 255))
        self.replays = []

    def raw_png(self):
        '''return raw PNG representation of the current canvas'''
        img_io = BytesIO()
        self.canvas.save(img_io, 'PNG')
        img_io.seek(0)
        return img_io.read()

    def load_updates(self, data):
        '''receives image updates as a data_uri and decodes it to update self'''
        base64data = data.split(',')[1]
        img_data = base64.b64decode(base64data)
        updates = Image.open(BytesIO(img_data))

        self.canvas = Image.alpha_composite(self.canvas, updates)

        self.replays.append(self.canvas)

    def replay(self, gif=False):
        if not self.replays:
            return None
        
        of = BytesIO()

        self.replays[0].save(of,
                             'GIF' if gif else 'WebP',
                             save_all=True,
                             append_images=self.replays[1:],
                             duration=300,
                             loop=0)

        of.seek(0)

        return of.read()
