# Pronunciation Scorer
Tracking pronunciation accuracy using Python and Flask.

This app is to help users improve their pronunciation. Built on top of what was done and with the reference to [Samskrita-Bharati/sUktam: An application built to help users practice Sanskrit pronunciation.](https://github.com/Samskrita-Bharati/sUktam)

### How to run:
* Git clone GitHub into the desired destination: `https://github.com/Teresa-Yang/Pronunciation-Scorer.git`
* Ensure you set up a virtual environment
  * Navigate to the project directory "Pronunciation-Scorer" if not already in it within the terminal/comand prompt
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
* Run 'python main.py host-ip port debug(y/n)'.
  * Example: `python main.py 127.0.0.1 5000 True` in the terminal/command prompt
* You should be given a localhost link to open in your browser and view the application.

