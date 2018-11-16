# mlem

## Environment setup (commands for macOS only)

1. Make sure you have Python 3.6: `brew install python`.
2. Make sure you have pip 18+. Check with `pip3 -V`.
3. Install pipenv using `brew install pipenv`. You will need Xcode and Xcode command line tools for this. 
4. Clone the repository. Run `pipenv install` inside the repository.
5. To run a development server on your local machine, use `pipenv shell` and then `gunicorn wsgi:app`.
6. Go to [http://127.0.0.1:8000](http://127.0.0.1:8000) to see the app.
