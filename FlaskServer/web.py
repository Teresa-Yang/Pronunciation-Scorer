import os
import random
from pathlib import Path
import requests
import base64
import azure.cognitiveservices.speech as speechsdk

from flask import Flask, flash, send_from_directory, redirect, render_template, request, jsonify
from flask_session import Session
from librosa import load

from FlaskServer.ScoringFunctions import scoring_functions_withVAD

_path = Path(__file__).parent.__str__() + "\\files"
if not os.path.exists(_path):
    os.mkdir(_path)

UPLOAD_FOLDER = 'files'
app = Flask(__name__)
sess = Session()

app.config['SECRET_KEY'] = 'secret_secret'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SESSION_TYPE'] = 'filesystem'

sess.init_app(app)

subscription_key = 'b36e4615cce844da8cd0e61f650bef9e'
region = "eastus"
language = "en-US"
voice = "Microsoft Server Speech Text to Speech Voice (en-US, JennyNeural)"


# Home page, render the "index.html" template
@app.route('/')
def home():
    return render_template('index.html', name=None)

# Dummy response to satisfy website if it does get request to .../favicon.ico
@app.route('/favicon.ico', methods=['GET'])
def favicon():
    return '<h1></h1>'

@app.route("/gettoken", methods=["POST"])
def gettoken():
    fetch_token_url = 'https://%s.api.cognitive.microsoft.com/sts/v1.0/issueToken' %region
    headers = {
        'Ocp-Apim-Subscription-Key': subscription_key
    }
    response = requests.post(fetch_token_url, headers=headers)
    access_token = response.text
    return jsonify({"at":access_token})



@app.route("/ackaud", methods=["POST"])
def ackaud():
    f = request.files['audio_data']
    reftext = request.form.get("engish")
    # reftext = request.form.get("reftext")
    #    f.save(audio)
    #print('file uploaded successfully')

    # a generator which reads audio data chunk by chunk
    # the audio_source can be any audio input stream which provides read() method, e.g. audio file, microphone, memory stream, etc.
    def get_chunk(audio_source, chunk_size=1024):
        while True:
            #time.sleep(chunk_size / 32000) # to simulate human speaking rate
            chunk = audio_source.read(chunk_size)
            if not chunk:
                #global uploadFinishTime
                #uploadFinishTime = time.time()
                break
            yield chunk

    # build pronunciation assessment parameters
    referenceText = reftext
    pronAssessmentParamsJson = "{\"ReferenceText\":\"%s\",\"GradingSystem\":\"HundredMark\",\"Dimension\":\"Comprehensive\",\"EnableMiscue\":\"True\"}" % referenceText
    pronAssessmentParamsBase64 = base64.b64encode(bytes(pronAssessmentParamsJson, 'utf-8'))
    pronAssessmentParams = str(pronAssessmentParamsBase64, "utf-8")

    # build request
    url = "https://%s.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=%s&usePipelineVersion=0" % (region, language)
    headers = { 'Accept': 'application/json;text/xml',
                'Connection': 'Keep-Alive',
                'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
                'Ocp-Apim-Subscription-Key': subscription_key,
                'Pronunciation-Assessment': pronAssessmentParams,
                'Transfer-Encoding': 'chunked',
                'Expect': '100-continue' }

    #audioFile = open('audio.wav', 'rb')
    audioFile = f
    # send request with chunked data
    response = requests.post(url=url, data=get_chunk(audioFile), headers=headers)
    #getResponseTime = time.time()
    audioFile.close()

    #latency = getResponseTime - uploadFinishTime
    #print("Latency = %sms" % int(latency * 1000))

    return response.json()



# Get score from recently uploaded file
@app.route('/get_score/<audio_id>/', methods=['GET'])
def get_score(audio_id):
    # find user audio from "files"
    path_user = Path(__file__).parent.__str__() + "\\files\\" + audio_id + ".mp3"

    # find corresponding proper audio
    path_proper = Path(__file__).parent.parent.__str__() + "\\hackathon_data\\" + audio_id + ".wav"

    user_series, sr = load(path_user, sr=16000)
    proper_series, sr = load(path_proper, sr=16000)

    return str(round(100 * scoring_functions_withVAD.score_pronunciation(proper_series, user_series))) + '%'



# Navigation to url will generate random choice and return to HTML
@app.route('/get_random_line', methods=['GET'])
def get_random_line():
    path = Path(__file__).parent.__str__() + "\\reference_files.txt"
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
        path = Path(__file__).parent.__str__() + f"\\files\\{file.filename}"
        file.save(path)

        return "<h1>Success!</h1>"

    # TODO: add scoring capability and return score
    if request.method == "GET":
        return ""


@app.route('/get_random_audio/<audio_id>/', methods=['GET'])
def get_random_audio(audio_id):
    path = Path(__file__).parent.parent.__str__() + "\\hackathon_data"
    audio_id = audio_id + ".wav"
    for file in os.listdir(path):
        if file.endswith(audio_id):
            return send_from_directory(
                directory=path,
                path=audio_id)
    return None


def run(host, port, debug):
    app.run(host, port, debug)
