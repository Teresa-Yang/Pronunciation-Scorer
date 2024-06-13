// let start_button_element = document.getElementById("start_button");
// start_button_element.onclick = handleStartButtonClick;
// let stop_button_element = document.getElementById("stop_button");
// stop_button_element.onclick = handleStopButtonClick;
// let score_button_element = document.getElementById("score_button");
// score_button_element.onclick = handleScoreButtonClick;
// let random_button_element = document.getElementById("random_button");
// random_button_element.onclick = handleRandomButtonClick;

// let prompted_audio_element = document.getElementById("prompted_audio");
// let recorded_audio_element = document.getElementById("recorded_audio");


var accuracyScore = document.getElementById('accuracy_score');
var fluencyScore = document.getElementById('fluency_score');
var completenessScore = document.getElementById('completeness_score');
var pronScore = document.getElementById('pron_score');
var wordsOmitted = document.getElementById('words_omitted');
var wordsInserted = document.getElementById('words_inserted');
var omittedWords = "";
var insertedWords = "";
wordsInserted.style.display = "none";
document.getElementById("wih").style.display = "none";

var wordRow = document.getElementById('word_row');
var phonemeRow = document.getElementById('phoneme_row');
var scoreRow = document.getElementById('score_row');

var refText = document.getElementById('ref_text');
var formContainer = document.getElementById('form_container');
var randomPhraseButton = document.getElementById('random_phrase_button');
var hearButton = document.getElementById('hear_button');
var recording = document.getElementById('recording');
var phrase = document.getElementById('phrase');
var lastGetPhraseText;
var objectUrlMain;
var wordAudioUrls = new Array;

var phthreshold1 = 80;
var phthreshold2 = 60;
var phthreshold3 = 40;
var phthreshold4 = 20;

var AudioContext = window.AudioContext || window.webkitAudioContext;;
var audioContent;
var start = false;
var stop = false;
var permission = false;
var refTextVal;
var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var audioStream; 					//MediaStreamAudioSourceNode we'll be recording
var blobPronun;
var offsetsArr;
var tFlag = true;
var wordList;

var t0 = 0;
var t1;
var at;

window.onload = () => {
    if (tFlag) {
        tFlag = getToken();
        tFlag = false;
    }

};

function getToken() {
    var request = new XMLHttpRequest();
    request.open('POST', '/get-token', true);

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

// function playWord(k) {
//     var audio = document.getElementById('phrase_audio');
//     audio.playbackRate = 0.5;
//     audio.currentTime = (offsetsArr[k] / 1000) + 0;

//     var stopAfter = 10000;

//     if (k != offsetsArr.length - 1) {
//         stopAfter = (offsetsArr[k + 1] / 1000) + 0.01;
//     }

//     audio.play();

//     var pausing_function = function () {
//         if (this.currentTime >= stopAfter) {
//             this.pause();
//             this.currentTime = 0;
//             stopAfter = 10000;
//             // remove the event listener after you paused the playback
//             this.removeEventListener("timeupdate", pausing_function);
//             audio.playbackRate = 0.9;
//         }
//     };

//     audio.addEventListener("timeupdate", pausing_function);

// }

function playWord(word) {
    var audio = document.getElementById('phrase_audio');
    audio.playbackRate = 0.5;

    for (var i = 0; i < wordAudioUrls.length; i++) {
        if (wordAudioUrls[i].word == word) {
            audio.src = wordAudioUrls[i].objectUrl;
            audio.playbackRate = 0.7;
            audio.play();
            break;
        }
    }

    var ending_function = function () {
        audio.src = objectUrlMain;
        audio.playbackRate = 0.9;
        audio.autoplay = false;
        audio.removeEventListener("ended", ending_function);
    };

    audio.addEventListener("ended", ending_function);
}

refText.onclick = function () { handleWordClick() };

function handleWordClick() {
    const activeTextarea = document.activeElement;
    var k = activeTextarea.selectionStart;

    refTextVal = refText.value;
    wordList = refTextVal.split(" ");

    var c = 0;
    var i = 0;
    for (i = 0; i < wordList.length; i++) {
        c += wordList[i].length;
        if (c >= k) {
            // playwordind(wordlist[i]);
            //playword(i);
            playWord(wordList[i]);
            break;
        }
        c += 1;
    }

}

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

//function for onclick of hear pronunciation button
hearButton.onclick = function () {
    refTextVal = refText.value;

    if (refTextVal != lastGetPhraseText) {
        document.getElementById("phrase_loader").style.display = "block";

        var request = new XMLHttpRequest();
        request.open('POST', '/get-phrase-text-to-speech', true);
        request.responseType = "blob";

        // Callback function for when request completes
        request.onload = () => {
            var blobPronun = request.response;
            var offsets = request.getResponseHeader("offsets");
            offsetsArr = offsets.substring(1, offsets.length - 1).replace(/ /g, "").split(',').map(Number);;

            objectUrlMain = URL.createObjectURL(blobPronun);

            var au = document.createElement('audio');
            var li = document.createElement('p');

            //add controls to the <audio> element
            au.controls = true;
            au.autoplay = true;
            au.id = "phrase_audio"
            au.src = objectUrlMain;

            //add the new audio element to li
            li.appendChild(au);

            //add the li element to the ol

            if (phrase.hasChildNodes()) {
                phrase.lastChild.remove();
            }

            phrase.appendChild(li);
            phrase.style.display = "block";

            document.getElementById("phrase_loader").style.display = "none";
        }
        const dat = new FormData();
        dat.append("refText", refTextVal);

        //send request
        request.send(dat);

        lastGetPhraseText = refTextVal;

        wordList = refTextVal.split(" ");
        for (var i = 0; i < wordList.length; i++) {
            getTextToSpeechForWord(wordList[i]);
        }

    }
    else {
        console.log("Phrase Audio for given text already exists. You may change ref text");
    }

    return false;
}

function getTextToSpeechForWord(word) {
    var request = new XMLHttpRequest();
    request.open('POST', '/get-text-to-speech-for-word', true);
    request.responseType = "blob";

    // Callback function for when request completes
    request.onload = () => {
        var blobPronun = request.response;
        var objectUrl = URL.createObjectURL(blobPronun);
        wordAudioUrls.push({ word, objectUrl });
    }
    const dat = new FormData();
    dat.append("word", word);

    //send request
    request.send(dat);
}

//function for onclick of get phrase button
randomPhraseButton.onclick = function () {
    var request = new XMLHttpRequest();
    request.open('POST', '/get-random-phrase', true);

    // Callback function for when request completes
    request.onload = () => {
        // Extract JSON data from request
        // const data = JSON.parse(request.responseText);
        // refTextVal = data.phrase;
        // refText.value = refTextVal;
        // refText.innerText = refTextVal;
        const result = request.responseText;
        const list = result.split(",");
        document.getElementById('sanskrit').value = list[2];
        document.getElementById('english').value = list[1];
        refTextVal = list[1];
        refText.value = refTextVal;
        refText.innerText = refTextVal;
        // audio_name = list[0].substring(list[0].indexOf("/") + 1, list[0].lastIndexOf("."));
    }

    //send request
    request.send();

    return false;
}

//function for handling main button clicks
document.getElementById('record_button').onclick = function () {

    if (refText.value.length == 0) {
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
            refText.readonly = true;
            refText.disabled = true;
            randomPhraseButton.disabled = true;
            randomPhraseButton.className = "btn";
            refTextVal = refText.value;

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
            omittedWords += w.Word;
            omittedWords += ', ';

            var tdda = document.createElement('td');
            tdda.innerText = '-';
            phonemeRow.appendChild(tdda);

            var tddb = document.createElement('td');
            tddb.innerText = '-';
            scoreRow.appendChild(tddb);

            var tdw = document.createElement('td');
            tdw.innerText = w.Word;
            tdw.style.backgroundColor = "orange";
            wordRow.appendChild(tdw);
        }
        else if (w.ErrorType == "Insertion") {
            insertedWords += w.Word;
            insertedWords += ', ';
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
                phonemeRow.appendChild(tdp);

                var tds = document.createElement('td');
                tds.innerText = p.AccuracyScore;
                scoreRow.appendChild(tds);
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
            wordRow.appendChild(tdw);
        }

    }
}

function fillData(data) {

    document.getElementById("summary_table").style.display = "flex";
    accuracyScore.innerText = data.AccuracyScore;
    fluencyScore.innerText = data.FluencyScore;
    completenessScore.innerText = data.CompletenessScore;
    pronScore.innerText = parseInt(data.PronScore, 10);

    fillDetails(data.Words);
    wordsOmitted.innerText = omittedWords;
    if (insertedWords != "") {
        document.getElementById("wih").style.display = "block";
        wordsInserted.style.display = "block";
        wordsInserted.innerText = insertedWords;
    }
}

function createDownloadLink(blob) {

    document.getElementById("record_loader").style.display = "block";

    document.getElementById("footer_alert").style.display = "none";
    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    var li = document.createElement('p');
    var link = document.createElement('a');

    //name of .wav file to use during upload and download (without extendion)
    var fileName = new Date().toISOString();

    //add controls to the <audio> element
    au.controls = true;
    au.src = url;

    //add the new audio element to li
    li.appendChild(au);

    //add the li element to html
    recording.appendChild(li);
    recording.style.display = "block";

    var request = new XMLHttpRequest();
    request.open('POST', '/ack-audio', true);

    // Callback function for when request completes
    request.onload = () => {
        // Extract JSON data from request

        const data = JSON.parse(request.responseText);

        if (data.RecognitionStatus == "Success") {
            fillData(data.NBest[0]);
            document.getElementById("record_loader").style.display = "none";
            document.getElementById("metrics").style.display = "block";
        }
        else {
            alert("Did not catch audio properly! Please try again.");
            console.log("Server returned: Error");
            console.log(data.RecognitionStatus);
        }
    }
    // Add data to send with request
    const data = new FormData();
    data.append("audio_data", blob, fileName);
    data.append("refText", refTextVal);

    //send request
    request.send(data);

    return false;
}


// let audio_name = '';
// let record = null;
// let audioChunks = [];

// // Function for "Get my score" button
// function handleScoreButtonClick(){
//     console.log("'Get my score' button clicked");

//     $.ajax({
//         type: 'GET',
//         url: '/get_score/' + audio_name + "/",
//         success: function (result) {
//             $('#score').val(result);
//         }
//     });
// }

// // Function for "Get a random phrase" button
// function handleRandomButtonClick() {
//     console.log("'Get a random phrase' button clicked");

//     start_button_element.disabled = false;

//     $.ajax({
//         type: 'GET',
//         url: '/get_random_line',
//         success: function (result) {
//             const list = result.split(",");
//             $('#sanskrit').val(list[2]);
//             $('#english').val(list[1]);
//             reftextval = list[1];
//             audio_name = list[0].substring(list[0].indexOf("/") + 1, list[0].lastIndexOf("."));

//             // Fetch audio data from /get_random_audio/{audio_name} endpoint
//             fetch(`/get_random_audio/${audio_name}`)
//                 .then(response => response.arrayBuffer())
//                 .then(buffer => {
//                     // Create Blob object from array buffer
//                     const blob = new Blob([buffer], { type: "audio/wav" });
//                     //   const blob = new Blob([buffer], { type: "audio/mpeg-3" });

//                     // Set source of audio element to Blob URL
//                     prompted_audio_element.src = URL.createObjectURL(blob);
//                     prompted_audio_element.controls = true;
//                     prompted_audio_element.autoplay = true;
//                 })
//                 .catch(error => {
//                     console.error("Error fetching audio:", error);
//                 });
//         },
//         error: function (xhr, status, error) {
//             console.error("Request failed:", xhr, status, error);
//         }
//     });
// }

// // Function for "Stop recording" button
// function handleStopButtonClick() {
//     console.log("'Stop recording' button clicked");

//     start_button_element.disabled = false;
//     stop_button_element.disabled = true;
//     record.stop();
// }

// // Function for "Start recording" button
// function handleStartButtonClick() {
//     console.log("'Start Recording' button clicked");

//     start_button_element.disabled = true;
//     stop_button_element.disabled = false;
//     audioChunks = [];
//     record.start();
// }

// navigator.mediaDevices
//     .getUserMedia({ audio: true })
//     .then(stream => {
//         //create new recorder object
//         record = new MediaRecorder(stream);

//         //stream data from recorder to list
//         record.ondataavailable = e => {
//             audioChunks.push(e.data);
//             //once recorder is done send data to server
//             if (record.state === "inactive") {
//                 let blob = new Blob(audioChunks, { type: 'audio/wav' });

//                 //enabled audio playback
//                 recorded_audio_element.src = URL.createObjectURL(blob);
//                 recorded_audio_element.controls = true;
//                 recorded_audio_element.autoplay = false;

//                 //create file to save and send to server
//                 const form = new FormData();
//                 form.append('file', blob, audio_name + ".wav");
//                 $.ajax({
//                     type: 'POST',
//                     url: '/save-record',
//                     data: form,
//                     cache: false,
//                     processData: false,
//                     contentType: false,
//                     success: function () {
//                         console.log("Data Received!");
//                     }
//                 });
//                 createDownloadLink(blob);
//             }
            
//         }
//     });