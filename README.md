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

Windows
For Windows, ffmpeg is not typically installed through a package manager like on Linux or macOS. However, you can use tools like choco (Chocolatey) or manually download and set up ffmpeg.
Using Chocolatey
Install Chocolatey:
Open PowerShell as Administrator and run the following command:
Install ffmpeg:
After installing Chocolatey, run the following command in PowerShell as Administrator:
Manual Installation
Download ffmpeg:
Go to the FFmpeg download page and download the Windows build.
Extract and Set Up:
Extract the downloaded zip file to a directory (e.g., C:\ffmpeg).
Add the bin directory (e.g., C:\ffmpeg\bin) to your system's PATH environment variable so that ffmpeg can be accessed from any command prompt.
macOS
For macOS, you can use Homebrew, a popular package manager.
Using Homebrew
Install Homebrew:
Open the Terminal and run the following command:
Install ffmpeg:
After installing Homebrew, run the following command in the Terminal:
shCopy codebrew install ffmpeg
shCopy code/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
powershellCopy codechoco install ffmpeg
powershellCopy codeSet-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))


* Run 'python main.py host-ip port debug(y/n)'.
  * Example: `python main.py 127.0.0.1 5000 True` in the terminal/command prompt
* You should be given a localhost link to open in your browser and view the application.

