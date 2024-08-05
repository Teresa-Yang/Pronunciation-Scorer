# Pronunciation Scorer
Tracking pronunciation accuracy using Python and Flask.

This app is to help users improve their pronunciation. Built on top of what was done and with the reference to [Samskrita-Bharati/sUktam: An application built to help users practice Sanskrit pronunciation.](https://github.com/Samskrita-Bharati/sUktam)

### How to run:
* Git clone GitHub into the desired destination: `https://github.com/Teresa-Yang/Pronunciation-Scorer.git`
* Ensure you set up a virtual environment
  * Navigate to the project directory "Pronunciation-Scorer" if not already in it within the terminal/comand prompt
  * Initialize/recreate the virtual environment:
    * Windows (PowerShell):
      * `python -m venv env`
    * macOS or Linux:
      * `python3 -m venv env`
  * Activate the virtual environment:
    * Windows (Command Prompt):
      * `.\env\Scripts\activate`
    * Windows (PowerShell):
      * `.\env\Scripts\Activate.ps1`
    * macOS or Linux:
      * `source env/bin/activate`
* Install packages in the terminal/comand prompt with the requirements.txt file:
  * `pip install -r requirements.txt`
* Run `python main.py` in the terminal/command prompt.
* You should be given a localhost link to open in your browser and view the application.

---
If in the case that you get an additional error trying to run the scoring functions, you may need to set up **FFmpeg**.\\
* You can check and install FFmpeg from their site: https://www.ffmpeg.org/download.html
* Tutorial for Windows: [How to install ffmpeg on Windows](https://www.youtube.com/watch?v=JR36oH35Fgg)
* Tutorial for MacOS: [How to Install FFMPEG on Mac | Installing FFmpeg on macOS](https://youtu.be/dJ8y-VlMNAo) using [Homebrew](https://brew.sh)
