import os
from flask import Flask, flash, render_template, request, redirect
import speech_recognition as sr


# _path = Path(__file__).parent.__str__() + "\\files"
# if not os.path.exists(_path):
#     os.mkdir(_path)

app = Flask(__name__)



# # Dummy response to satisfy website if it does get request to .../favicon.ico
# @app.route('/favicon.ico', methods=['GET'])
# def favicon():
#     return '<h1></h1>'

# # Home page, render the "record.html" template
# @app.route('/')
# def home():
#     return render_template('index.html', name=None)

# Navigation will create GET request for website and POST request for audio data as mp3 file
@app.route('/', methods=['GET', 'POST'])
def index():
    transcript = ""
    if request.method == "POST":
        print("Audio data received")

        # Check if file existence
        if 'file' not in request.files:
            flash("Sorry! File not found!")
            return redirect(request.url)

        file = request.files['file']

        # Check that file is named correctly
        if file.filename == '':
            flash("Sorry! File name is empty!")
            return redirect(request.url)

        # # save file in hosts dir
        # path = Path(__file__).parent.__str__() + f"\\files\\{file.filename}"
        # file.save(path)

        #Using Python SpeechRecognition 
        if file:
            recognizer = sr.Recognizer()
            audioFile = sr.AudioFile(file)

            # Obtain audio from uploaded file
            with audioFile as source:
                data = recognizer.record(source)
                transcript = recognizer.recognize_google(data, key=None)

    return render_template('index.html', transcript=str(transcript))
    
    # # TODO: add scoring capability and return score
    # if request.method == "GET":
    #     return ""





# @app.route("/", methods=["GET", "POST"])
# def index():
#     transcript = ""
#     if request.method == "POST":
#         print("FORM DATA RECEIVED")

#         # Check if file exists
#         if "file" not in request.files:
#             flash("Sorry. File not found.")
#             return redirect(request.url)

#         file = request.files["file"]

#         # Check if file is named correctly
#         if file.filename == "":
#             flash("Sorry. File name is empty.")
#             return redirect(request.url)

#         # Using Python SpeechRecognition 
#         if file:
#             recognizer = sr.Recognizer()
#             audioFile = sr.AudioFile(file)

#             # Obtain audio from uploaded file
#             with audioFile as source:
#                 data = recognizer.record(source)
#                 transcript = recognizer.recognize_google(data, key=None)


#     return render_template('index.html', transcript=transcript)


if __name__ == "__main__":
    app.run(debug=True, threaded=True)