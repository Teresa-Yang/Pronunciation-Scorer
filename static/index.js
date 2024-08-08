let start_button_element = document.getElementById("start_button");
let stop_button_element = document.getElementById("stop_button");
let score_button_element = document.getElementById("score_button");
let random_button_element = document.getElementById("random_button");

let prompted_audio_element = document.getElementById("prompted_audio");
let recorded_audio_element = document.getElementById("recorded_audio");

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


stop_button_element.onclick = () => {
    stop_button_element.disabled = true;
    score_button_element.disabled = false;
    start_button_element.disabled = false;
    record.stop();
};

start_button_element.onclick = () => {
    start_button_element.disabled = true;
    stop_button_element.disabled = false;
    audioChunks = [];
    record.start();
};

random_button_element.onclick = () => {
    start_button_element.disabled = false;
    stop_button_element.disabled = true;
    score_button_element.disabled = true;

    ran = Math.floor((Math.random() * 100)) % rt.length;
    $('#sanskrit').val(rt[ran].t);
    $('#english').val(Sanscript.t(rt[ran].t, 'devanagari', 'iast'));
    audio_name = rt[ran].a.substring(0, rt[ran].a.indexOf(".wav"));
    console.log(audio_name);
    prompted_audio_element.src = base_url + rt[ran].a;
    prompted_audio_element.controls = true;
    prompted_audio_element.autoplay = true;


    // Uncomment to run locally
    // $.ajax(
    //     {
    //         type: 'GET',
    //         url: '/get_random_line',
    //         success: function (result) {
    //             const list = result.split(",");
    //             $('#sanskrit').val(list[2]);
    //             $('#english').val(list[1]);
    //             audio_name = list[0].substring(list[0].indexOf("/") + 1, list[0].lastIndexOf("."));

    //             fetch('/get_random_audio/' + audio_name)
    //                 .then(res => {
    //                     return res.body.getReader().read().then(result => {
    //                         return result
    //                     });
    //                 })
    //                 .then(data => {
    //                     const blob = new Blob([data.value], { type: "audio/mpeg-3" });

    //                     prompted_audio_element.src = URL.createObjectURL(blob);
    //                     prompted_audio_element.controls = true;
    //                     prompted_audio_element.autoplay = true;
    //                 });
    //         }
    //     }
    // );
};

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