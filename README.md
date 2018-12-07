# mlem

## Files and contents 
### Subdirectories:
#### static - static files
- banner.png, icon.png, reset.png - images for style

- script.js - file that contains all logic for the canvas interface.
              This includes handling mouse movements, and updating the 
              all clients canvases whenever one of the clients draws on 
              its respective canvas. Emits image data to mlem.py, which
              is listening for front end updates.

- style.css - styling

#### templates - holds html files
- create.html - room creation interface. Makes calls to server API in mlem.py
                that generates roomIDs for separate rooms.
- paint.html - canvas interface, which is the front end for all painting
                and drawing. HTML has a reference to script.py, which handles 
                all front end logic for this interface. 

### Files:
- canvas.py - canvas class with logic that will handle loading data that is 
              loaded from the server for persistency purposes. Interacts
              with mlem.py in order to save all changes made to the 
              global canvas for the respective room.

- mlem.py - server class, handling server requests and responses, 
                interacting with front end by listening to its requests, 
                and then emitting data to all listening clients.

## Environment setup (commands for macOS only)

1. Make sure you have Python 3.7: `brew install python`.
2. Make sure you have pip 18+. Check with `pip3 -V`.
3. Install pipenv using `brew install pipenv`. You will need Xcode and Xcode command line tools for this. 
4. Clone the repository. Run `pipenv install` inside the repository.
5. To run a development server on your local machine, use `pipenv shell` and then `gunicorn -k eventlet -w 1 wsgi:app --preload`.
6. Go to [http://127.0.0.1:8000](http://127.0.0.1:8000) to see the app.


