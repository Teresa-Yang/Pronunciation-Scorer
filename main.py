import os
import random
from pathlib import Path
from flask import Flask, flash, send_from_directory, redirect, render_template, request
from librosa import load
from ScoringFunctions import scoring_functions_withVAD
# from ScoringFunctions import scoring_functions



_path = Path(__file__).parent.__str__() + "/files"
if not os.path.exists(_path):
    os.mkdir(_path)

UPLOAD_FOLDER = 'files'
app = Flask(__name__)

app.config['SECRET_KEY'] = 'secret_secret'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SESSION_TYPE'] = 'filesystem'


# Dummy response to satisfy website if it does get request to .../favicon.ico
@app.route('/favicon.ico', methods=['GET'])
def favicon():
    return '<h1></h1>'

# # Home page, render the "index.html" template
@app.route('/')
def index():
    return redirect('/home', code=302)

# Redirect '/home' to our rendering function
@app.route('/home')
def showHomePage():
    return render_template('record.html', name=None)

# Get score from recently uploaded file
@app.route('/get_score/<audio_id>/', methods=['GET'])
def get_score(audio_id):
    # find user audio from "files"
    path_user = Path(__file__).parent.__str__() + "/files/" + audio_id + ".mp3"

    # find corresponding proper audio
    path_proper = Path(__file__).parent.__str__() + "/hackathon_data/" + audio_id + ".wav"

    user_series, sr = load(path_user, sr=16000)
    proper_series, sr = load(path_proper, sr=16000)

    return str(round(100 * scoring_functions_withVAD.score_pronunciation(proper_series, user_series))) + '%'
    # return str(round(100 * scoring_functions.score_pronunciation(proper_series, user_series))) + '%'

# Navigation to url will generate random choice and return to HTML
@app.route('/get_random_line', methods=['GET'])
def get_random_line():
    path = Path(__file__).parent.__str__() + "/reference_files.txt"
    lines = open(path, encoding="UTF-8").readlines()[1:]
    return random.choice(lines)

# Navigation will create GET request for website and POST request for audio data as mp3 file
@app.route('/save-record', methods=['GET', 'POST'])
def save_record():
    flash("saving")
    if request.method == "POST":
        # Sanity check on file existence
        if 'file' not in request.files:
            flash("Sorry! File not found!")
            redirect(request.url)

        file = request.files['file']

        # Sanity check that file is named correctly
        if file.filename == '':
            flash("Sorry! File name is empty!")
            redirect(request.url)

        # save file in hosts dir
        path = Path(__file__).parent.__str__() + f"/files/{file.filename}"
        file.save(path)

        return "<h1>Success!</h1>"

    # TODO: add scoring capability and return score
    if request.method == "GET":
        return ""


@app.route('/get_random_audio/<audio_id>/', methods=['GET'])
def get_random_audio(audio_id):
    path = Path(__file__).parent.__str__() + "/hackathon_data"
    audio_id = audio_id + ".wav"
    for file in os.listdir(path):
        if file.endswith(audio_id):
            return send_from_directory(
                directory=path,
                path=audio_id)
    return None


if __name__ == "__main__":
    app.run(debug=True)
