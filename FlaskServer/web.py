
import os
import random
from pathlib import Path
from flask import Flask, flash, send_from_directory, redirect, render_template, request
from flask_session import Session
from librosa import load
from FlaskServer.ScoringFunctions import scoring_functions_withVAD

_path = os.path.join(Path(__file__).parent, "files")
if not os.path.exists(_path):
    os.mkdir(_path)

UPLOAD_FOLDER = 'files'
app = Flask(__name__)
sess = Session()

app.config['SECRET_KEY'] = 'secret_secret'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SESSION_TYPE'] = 'filesystem'

sess.init_app(app)

@app.route('/get_score/<audio_id>/', methods=['GET'])
def get_score(audio_id):
    path_user = os.path.join(Path(__file__).parent, "files", f"{audio_id}.mp3")
    path_proper = os.path.join(Path(__file__).parent.parent, "hackathon_data", f"{audio_id}.wav")

    user_series, sr = load(path_user, sr=16000)
    proper_series, sr = load(path_proper, sr=16000)

    return str(round(100 * scoring_functions_withVAD.score_pronunciation(proper_series, user_series))) + '%'

@app.route('/favicon.ico', methods=['GET'])
def favicon():
    return '<h1></h1>'

@app.route('/get_random_line', methods=['GET'])
def get_random_line():
    path = os.path.join(Path(__file__).parent, "reference_files.txt")
    lines = open(path, encoding="UTF-8").readlines()[1:]
    return random.choice(lines)

@app.route('/')
def home():
    return render_template('index.html', name=None)

@app.route('/save-record', methods=['GET', 'POST'])
def save_record():
    flash("saving")
    if request.method == "POST":
        if 'file' not in request.files:
            flash("Sorry! File not found!")
            redirect(request.url)

        file = request.files['file']

        if file.filename == '':
            flash("Sorry! File name is empty!")
            redirect(request.url)

        path = os.path.join(Path(__file__).parent, "files", file.filename)
        file.save(path)

        return "<h1>Success!</h1>"

    if request.method == "GET":
        return ""

@app.route('/get_random_audio/<audio_id>/', methods=['GET'])
def get_random_audio(audio_id):
    path = os.path.join(Path(__file__).parent.parent, "hackathon_data")
    audio_id = f"{audio_id}.wav"
    for file in os.listdir(path):
        if file.endswith(audio_id):
            return send_from_directory(directory=path, path=audio_id)
    return None

def run(host, port, debug):
    app.run(host, port, debug)
