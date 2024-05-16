from flask import Flask, flash, render_template, request, redirect
import speech_recognition as sr

app = Flask(__name__)


# Navigation will create GET request for website and POST request for audio data as mp3 file

@app.route("/", methods=["GET", "POST"])
def index():
    transcript = ""
    recording = False
    if request.method == "POST":
        if "voice-input" in request.form:
            print("VOICE INPUT FORM SUBMITTED")
            transcript = recognize_voice_input()
            recording = False
        elif "file" in request.files:
            print("FILE UPLOADED FOR TRANSCRIPTION")
            transcript = recognize_uploaded_file()

    return render_template('index.html', transcript=transcript, recording=recording)

def recognize_voice_input():
    recognizer = sr.Recognizer()

    with sr.Mic() as source:
        print("Listening...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)

    try:
        transcript = recognizer.recognize_google(audio, key=None)
        return transcript
    
    except Exception as e:
        print(f"Error while trying to transcribe voice input: {e}")
        return ""

def recognize_uploaded_file():
    if "file" not in request.files:
        flash("Sorry. File not found.")
        return redirect(request.url)

    file = request.files["file"]

    if file.filename == "":
        flash("Sorry. File name is empty.")
        return redirect(request.url)

    recognizer = sr.Recognizer()
    audioFile = sr.AudioFile(file)

    with audioFile as source:
        data = recognizer.record(source)
        transcript = recognizer.recognize_google(data, key=None)

    return transcript








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


# if __name__ == "__main__":
#     app.run(debug=True, threaded=True)