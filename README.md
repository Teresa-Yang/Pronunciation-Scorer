# Pronunciation Scorer
Tracking pronunciation accuracy using Python and Flask.

This app is to help users improve their pronunciation. Built with the reference to [Samskrita-Bharati/sUktam: An application built to help users practice Sanskrit pronunciation.](https://github.com/Samskrita-Bharati/sUktam)

---
### To run:
* Enter `flask run` in the terminal/comand prompt within the project directory
---
### How to run if there are errors for dependencies or virtual environment (Personally used Visual Studio Code but should not matter on the IDE):
* Clone the project
* Ensure you set up a virtual environment
  * Navigate to the project directory if not already in it within the terminal/comand prompt
  * Remove the "env" folder:
    * `Remove-Item -Path 'env' -Recurse`
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
* Run as a local server with `flask run`
  * You should be given a localhost link to open in your browser and view the program.

 ---
 ### Upload audio files in wav format
 Use this converter to convert audio files if needed: https://cloudconvert.com/mp3-to-wav
