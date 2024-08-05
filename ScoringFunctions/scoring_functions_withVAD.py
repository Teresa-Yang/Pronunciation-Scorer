import librosa
import numpy as np
import torch

torch.set_num_threads(1)


###
# New scoring function with VAD
class VAD:
    def __init__(self):
        self.model, self.utils = torch.hub.load(repo_or_dir='snakers4/silero-vad',
                                                model='silero_vad',
                                                force_reload=True,
                                                onnx=False)
        #     self.get_speech_timestamps = self.utils[0]
        self.SAMPLING_RATE = 16000

    def run(self, audio):
        audio = torch.Tensor(audio)
        get_speech_timestamps = self.utils[0]
        speech_timestamps = get_speech_timestamps(audio, self.model, sampling_rate=self.SAMPLING_RATE)
        speech_timestamps = self.extend_segments(audio, speech_timestamps)
        return speech_timestamps

    def extend_segments(self, audio, timestamps, ext=0.030):
        extlen = int(ext * self.SAMPLING_RATE)
        new_timestamps = []
        prev_end = 0
        audiolen = audio.shape[0]
        for ts in timestamps:
            st = max(prev_end, ts['start'] - extlen)
            en = min(audiolen, ts['end'] + extlen)
            prev_end = en
            new_timestamps.append({'start': st, 'end': en})
        return new_timestamps

    def get_speechonly_audio(self, audio):
        audio = torch.Tensor(audio)
        speech_timestamps = self.run(audio)
        collect_chunks = self.utils[-1]
        audio_speech = collect_chunks(speech_timestamps, audio)
        return audio_speech.numpy()


vad_extractor =  VAD()


def compute_mfcc(x, fs):
    # 25ms frame length
    win_length = 25 * 1e-3 * fs
    # 10ms frame shift
    hop_length = 10 * 1e-3 * fs
    # Number of mfcc dimensions
    n_mfcc = 13
    n_mels = 40
    mfcc = librosa.feature.mfcc(y=x, sr=fs, window='hamming', n_mfcc=n_mfcc, n_mels=n_mels)
    mfcc_norm = (mfcc.T - np.mean(mfcc.T, axis=0)) / (1e-6 + np.std(mfcc.T, axis=0))
    mfcc = mfcc_norm.T
    return mfcc


###########################
# Make sure to convert the audio to 16kHz sampling rate before you call score_pronunciation
###########################
def score_pronunciation(audio_ref, audio_user, fs=16000):
    # Cut the silence in the audio
    audio_ref_speech = vad_extractor.get_speechonly_audio(audio_ref)
    audio_user_speech = vad_extractor.get_speechonly_audio(audio_user)
    mfcc_ref = compute_mfcc(audio_ref_speech, fs)
    mfcc_user = compute_mfcc(audio_user_speech, fs)
    D, wp, steps = librosa.sequence.dtw(X=mfcc_ref, Y=mfcc_user, backtrack=True, return_steps=True)
    raw_score = D[wp[0][0], wp[0][1]]
    #     score = 1/1+np.exp(raw_score)
    score = 1 / (1 + np.exp(0.033 * (raw_score - 250)))
    return score
