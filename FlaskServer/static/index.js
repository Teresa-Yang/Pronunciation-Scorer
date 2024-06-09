let start_button_element = document.getElementById("start_button");
start_button_element.onclick = handleStartButtonClick;
let stop_button_element = document.getElementById("stop_button");
stop_button_element.onclick = handleStopButtonClick;
let score_button_element = document.getElementById("score_button");
score_button_element.onclick = handleScoreButtonClick;
let random_button_element = document.getElementById("random_button");
random_button_element.onclick = handleRandomButtonClick;

let prompted_audio_element = document.getElementById("prompted_audio");
let recorded_audio_element = document.getElementById("recorded_audio");


var accuracyscore = document.getElementById('accuracyscore');
var fluencyscore = document.getElementById('fluencyscore');
var completenessscore = document.getElementById('completenessscore');
var pronscore = document.getElementById('pronscore');
var wordsomitted = document.getElementById('wordsomitted');
var wordsinserted = document.getElementById('wordsinserted');
var omittedwords = "";
var insertedwords = "";
wordsinserted.style.display = "none";
document.getElementById("wih").style.display = "none";

var wordrow = document.getElementById('wordrow');
var phonemerow = document.getElementById('phonemerow');
var scorerow = document.getElementById('scorerow');
var lastgettstext;
var objectUrlMain;
var wordaudiourls = new Array;

var phthreshold1 = 80;
var phthreshold2 = 60;
var phthreshold3 = 40;
var phthreshold4 = 20;

var AudioContext = window.AudioContext || window.webkitAudioContext;;
var audioContent;
var start = false;
var stop = false;
var permission = false;
var reftextval;
var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var audioStream ; 					//MediaStreamAudioSourceNode we'll be recording
var blobpronun;
var offsetsarr;
var tflag = true;
var wordlist;

var t0 = 0;
var t1;
var at;

window.onload = () => {
    if(tflag){
        tflag = gettoken();
        tflag = false;
    }
    
};

function gettoken() {
    var request = new XMLHttpRequest();
    request.open('POST', '/gettoken', true);

    // Callback function for when request completes
    request.onload = () => {
        // Extract JSON data from request
        const data = JSON.parse(request.responseText);
        at = data.at;
    }

    //send request
    request.send();
    return false;
}



let audio_name = '';
let record = null;
let audioChunks = [];

// Function for "Get my score" button
function handleScoreButtonClick(){
    console.log("'Get my score' button clicked");

    $.ajax({
        type: 'GET',
        url: '/get_score/' + audio_name + "/",
        success: function (result) {
            $('#score').val(result);
        }
    });
}

// Function for "Get a random phrase" button
function handleRandomButtonClick() {
  console.log("'Get a random phrase' button clicked");

  start_button_element.disabled = false;

  $.ajax({
    type: 'GET',
    url: '/get_random_line',
    success: function (result) {
      const list = result.split(",");
      $('#sanskrit').val(list[2]);
      $('#english').val(list[1]);
      audio_name = list[0].substring(list[0].indexOf("/") + 1, list[0].lastIndexOf("."));

      // Fetch audio data from /get_random_audio/{audio_name} endpoint
      fetch(`/get_random_audio/${audio_name}`)
        .then(response => response.arrayBuffer())
        .then(buffer => {
          // Create Blob object from array buffer
          const blob = new Blob([buffer], { type: "audio/wav" });
        //   const blob = new Blob([buffer], { type: "audio/mpeg-3" });

          // Set source of audio element to Blob URL
          prompted_audio_element.src = URL.createObjectURL(blob);
          prompted_audio_element.controls = true;
          prompted_audio_element.autoplay = true;
        })
        .catch(error => {
          console.error("Error fetching audio:", error);
        });
    },
    error: function (xhr, status, error) {
      console.error("Request failed:", xhr, status, error);
    }
  });
}

// Function for "Stop recording" button
function handleStopButtonClick() {
    console.log("'Stop recording' button clicked");

    start_button_element.disabled = false;
    stop_button_element.disabled = true;
    record.stop();
}

// Function for "Start recording" button
function handleStartButtonClick() {
    console.log("'Start Recording' button clicked");

    start_button_element.disabled = true;
    stop_button_element.disabled = false;
    audioChunks = [];
    record.start();
}

navigator.mediaDevices
.getUserMedia({ audio: true })
.then(stream => {
        //create new recorder object
        record = new MediaRecorder(stream);

        //stream data from recorder to list
        record.ondataavailable = e => {
            audioChunks.push(e.data);
            //once recorder is done send data to server
            if (record.state === "inactive") {
                let blob = new Blob(audioChunks, { type: 'audio/wave' });

                //enabled audio playback
                recorded_audio_element.src = URL.createObjectURL(blob);
                recorded_audio_element.controls = true;
                recorded_audio_element.autoplay = false;

                //create file to send to server
                const form = new FormData();
                form.append('file', blob, audio_name + ".wav");
                $.ajax({
                    type: 'POST',
                    url: '/save-record',
                    data: form,
                    cache: false,
                    processData: false,
                    contentType: false,
                    success: function () {
                        console.log("Data Received!");
                    }
                });

            }
        }
});

var soundAllowed = function (stream) {
    permission = true;
    audioContent = new AudioContext();
    gumStream = stream;
    audioStream = audioContent.createMediaStreamSource(stream);
    rec = new Recorder(audioStream, { numChannels: 1 })

    //start the recording process
    rec.record()
}
    
var soundNotAllowed = function (error) {
    h.innerHTML = "You must allow your microphone.";
    console.log(error);
}

//function for handling main button clicks
document.getElementById('buttonmic').onclick = function () {

    if (reftext.value.length == 0) {
        alert("Reference Text cannot be empty!");
    }
    else {
        if (stop) {
            window.location.reload();
        }
        else if (start) {

            start = false;
            stop = true;
            this.innerHTML = "<span class='fa fa-refresh'></span>Refresh";
            this.className = "green-button";
            rec.stop();

            //stop microphone access
            gumStream.getAudioTracks()[0].stop();

            //create the wav blob and pass it on to createDownloadLink
            rec.exportWAV(createDownloadLink);
        }
        else {
            if (!permission) {
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(soundAllowed)
                    .catch(soundNotAllowed);
            }

            start = true;
            reftext.readonly = true;
            reftext.disabled = true;
            ttbutton.disabled = true;
            ttbutton.className = "btn";
            reftextval = reftext.value;

            this.innerHTML = "<span class='fa fa-stop'></span>Stop";
            this.className = "red-button";
        }
    }
};


function fillDetails(words) {
    for (var wi in words) {
        var w = words[wi];
        var countp = 0;

        if (w.ErrorType == "Omission") {
            omittedwords += w.Word;
            omittedwords += ', ';

            var tdda = document.createElement('td');
            tdda.innerText = '-';
            phonemerow.appendChild(tdda);

            var tddb = document.createElement('td');
            tddb.innerText = '-';
            scorerow.appendChild(tddb);

            var tdw = document.createElement('td');
            tdw.innerText = w.Word;
            tdw.style.backgroundColor = "orange";
            wordrow.appendChild(tdw);
        }
        else if (w.ErrorType == "Insertion") {
            insertedwords += w.Word;
            insertedwords += ', ';
        }
        else if (w.ErrorType == "None" || w.ErrorType == "Mispronunciation") {
            for (var phonei in w.Phonemes) {
                var p = w.Phonemes[phonei]

                var tdp = document.createElement('td');
                tdp.innerText = p.Phoneme;
                if (p.AccuracyScore >= phthreshold1) {
                    tdp.style.backgroundColor = "green";
                }
                else if (p.AccuracyScore >= phthreshold2) {
                    tdp.style.backgroundColor = "lightgreen";
                }
                else if (p.AccuracyScore >= phthreshold3) {
                    tdp.style.backgroundColor = "yellow";
                }
                else {
                    tdp.style.backgroundColor = "red";
                }
                phonemerow.appendChild(tdp);

                var tds = document.createElement('td');
                tds.innerText = p.AccuracyScore;
                scorerow.appendChild(tds);
                countp = Number(phonei) + 1;
            }
            var tdw = document.createElement('td');
            tdw.innerText = w.Word;
            var x = document.createElement("SUP");
            var t = document.createTextNode(w.AccuracyScore);
            x.appendChild(t);
            tdw.appendChild(x);
            tdw.colSpan = countp;
            if (w.ErrorType == "None") {
                tdw.style.backgroundColor = "lightgreen";
            }
            else {
                tdw.style.backgroundColor = "red";
            }
            wordrow.appendChild(tdw);
        }

    }
}

function fillData(data) {

    document.getElementById("summarytable").style.display = "flex";
    accuracyscore.innerText = data.AccuracyScore;
    fluencyscore.innerText = data.FluencyScore;
    completenessscore.innerText = data.CompletenessScore;
    pronscore.innerText = parseInt(data.PronScore, 10);

    fillDetails(data.Words);
    wordsomitted.innerText = omittedwords;
    if (insertedwords != "") {
        document.getElementById("wih").style.display = "block";
        wordsinserted.style.display = "block";
        wordsinserted.innerText = insertedwords;
    }
}