let start_button_element = document.getElementById("start_button");
let score_button_element = document.getElementById("score_button");
let random_button_element = document.getElementById("random_button");

let prompted_audio_element = document.getElementById("prompted_audio");
let recorded_audio_element = document.getElementById("recorded_audio");

let progress_bar_container = document.getElementById("progress_bar_container");
let progress_bar = document.getElementById("progress_bar");

let audio_name = '';
let record = null;
let audioChunks = [];

score_button_element.onclick = () => {
    score_button_element.disabled = true;
    $.ajax({
        type: 'GET',
        url: '/get_score/' + audio_name + "/",
        success: function (result) {
            $('#score').val(result);
        }
    });
};

random_button_element.onclick = () => {
    start_button_element.disabled = false;
    score_button_element.disabled = true;

    // --- To run on PythonAnywhere ---
    // ran = Math.floor((Math.random() * 100)) % rt.length;
    // $('#sanskrit').val(rt[ran].t);
    // $('#english').val(Sanscript.t(rt[ran].t, 'devanagari', 'iast'));
    // audio_name = rt[ran].a.substring(0, rt[ran].a.indexOf(".wav"));
    // console.log(audio_name);
    // prompted_audio_element.src = base_url + rt[ran].a;
    // prompted_audio_element.controls = true;
    // prompted_audio_element.autoplay = true;
    // -------------------------------------------------------------

    // --- To run locally ---
    $.ajax({
        type: 'GET',
        url: '/get_random_line',
        success: function (result) {
            const list = result.split(",");
            $('#sanskrit').val(list[2]);
            $('#english').val(list[1]);
            audio_name = list[0].substring(list[0].indexOf("/") + 1, list[0].lastIndexOf("."));

            fetch('/get_random_audio/' + audio_name)
                .then(res => res.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    prompted_audio_element.src = url;
                    prompted_audio_element.controls = true;
                    prompted_audio_element.autoplay = true;

                    // Get the duration of the audio file and set up the timer
                    prompted_audio_element.onloadedmetadata = function () {
                        let audio_duration = prompted_audio_element.duration * 1000; // Duration in milliseconds

                        start_button_element.onclick = () => {
                            start_button_element.disabled = true;
                            score_button_element.disabled = false;
                            audioChunks = [];
                            record.start();

                            // Show and reset the progress bar
                            progress_bar_container.style.display = "block";
                            progress_bar.style.width = "0%";

                            let startTime = Date.now();
                            let interval = setInterval(() => {
                                let elapsed = Date.now() - startTime;
                                let progress = Math.min(elapsed / audio_duration * 100, 100);
                                progress_bar.style.width = progress + "%";

                                if (progress >= 100) {
                                    clearInterval(interval);
                                    record.stop();
                                    start_button_element.disabled = false;
                                    progress_bar_container.style.display = "none"; // Hide the progress bar after completion
                                }
                            }, 50);
                        };
                    };
                });
        }
    });
    // -------------------------------------------------------------
};

navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(stream => {
        // Create new recorder object
        record = new MediaRecorder(stream);

        // Stream data from recorder to list
        record.ondataavailable = e => {
            audioChunks.push(e.data);
            // Once recorder is done send data to server
            if (record.state === "inactive") {
                let blob = new Blob(audioChunks, { type: 'audio/mpeg-3' });

                // Enable audio playback
                recorded_audio_element.src = URL.createObjectURL(blob);
                recorded_audio_element.controls = true;
                recorded_audio_element.autoplay = false;

                // Create file to send to server
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
        };
    });
