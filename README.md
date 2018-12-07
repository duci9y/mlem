# mlem

## Files and contents

- **static**: directory containing static files
    - **banner.png**: images for style
    - **icon.png**: images for style
    - **reset.png**: images for style
    - **style.css**: styling for the frontend
- **templates**: directory containing HTML files
- **create.html**: Room creation interface. Sends a post request to mlemphis.herokuapp.com/canvas, which is handled by the server API in mlem.py. Redirects the user to the room received from server response.
- **paint.html**: Canvas interface, which is the front end for all painting and drawing. Includes a reference to controller.js, which handles all front end logic for this interface.
- **controller.js**: Contains the implementation of the Controller class. It initializes the two stacked canvases (discussed in the “Design Reflections” section) and includes methods to handle mouse changes as well as emitting continuous image data to the server (at mlem.py) to broadcast to other clients using the same canvas.
- **canvas.py**: Contains the implementation of the Canvas class. Provides methods to get the raw PNG of the current canvas and to load updates from the server for persistency purposes. Interacts with mlem.py in order to save all changes made to the global canvas for the respective room.
- **mlem.py**: The server. Utilizes Flask routes and socketio. Interacts with front end by listening to its requests for room creation and joining, and emits data to listening clients by utilizing the Canvas class.

## Environment setup (commands for macOS only)

1. Make sure you have Python 3.7: `brew install python`.
2. Make sure you have pip 18+. Check with `pip3 -V`.
3. Install pipenv using `brew install pipenv`. You will need Xcode and Xcode command line tools for this.
4. Clone the repository. Run `pipenv install` inside the repository.
5. To run a development server on your local machine, use `pipenv shell` and then `gunicorn -k eventlet -w 1 wsgi:app --preload`.
6. Go to [http://127.0.0.1:8000](http://127.0.0.1:8000) to see the app.


