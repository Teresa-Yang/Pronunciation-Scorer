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

  // Ajax call to /get_random_line endpoint
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
          const blob = new Blob([buffer], { type: "audio/mpeg-3" });

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
                let blob = new Blob(audioChunks, { type: 'audio/mpeg-3' });

                //enabled audio playback
                recorded_audio_element.src = URL.createObjectURL(blob);
                recorded_audio_element.controls = true;
                recorded_audio_element.autoplay = false;

                //create file to send to server
                const form = new FormData();
                form.append('file', blob, audio_name + ".mp3");
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
