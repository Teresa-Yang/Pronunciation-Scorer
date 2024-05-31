##Working##

import librosa
import numpy as np
import pandas as pd
from scipy.spatial.distance import euclidean


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
    mfcc_ref = compute_mfcc(audio_ref, fs)
    mfcc_user = compute_mfcc(audio_user, fs)
    D, wp, steps = librosa.sequence.dtw(X=mfcc_ref, Y=mfcc_user, backtrack=True, return_steps=True)
    raw_score = D[wp[0][0], wp[0][1]]
    #     score = 1/1+np.exp(raw_score)
    score = 1 / (1 + np.exp((raw_score - 350) / 20))
    return score
