"""
Back-end of the Orpheus website, part of the TDLog project.
Authors: Alice Gribonval
         Louis Reine
         Ruben Persicot
"""

import os
import multiprocessing as mp
import zipfile
import tempfile

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from flask_restful import Api
from spleeter.separator import Separator


current_path = os.path.dirname(os.path.abspath(__file__))
audio_path = current_path + "/tmp/audio/"
res_path = current_path + "/tmp/res_process/"
zip_path = current_path + "/tmp/zip/"

app = Flask(__name__)
api = Api(app)

CORS(app)

PathManager = mp.Manager()

processing_queue = {}

paths_token = PathManager.dict()


def is_available(token):
    """Return True if token is available, False otherwise."""
    if processing_queue:
        return processing_queue[token].is_alive()
    return True


def zip_dir(path, zip_h):
    """Create zip folder containing all elements at given path."""
    for root, dirs, files in os.walk(path):
        for file in files:
            zip_h.write(os.path.join(root, file),
                        os.path.relpath(os.path.join(root, file), os.path.join(path, '..')))


def separate_audio(spleeter_arg, path_to_audio_file, token, paths_token):
    """Separate audio files associated to the token using spleeter"""
    separator = Separator(spleeter_arg)
    separator.separate_to_file(path_to_audio_file, res_path, synchronous=True)

    path_to_output_zip_file = zip_path + f'{token}.zip'
    paths_token[token] = path_to_output_zip_file

    zip_f = zipfile.ZipFile(path_to_output_zip_file, 'w', zipfile.ZIP_DEFLATED)
    zip_dir(res_path + token, zip_f)


@app.route('/process', methods=['POST'])
def process():
    """Start processing or queuing and return associated token."""
    audio_data = request.files["audio_data"]
    audio_bytes = audio_data.read()
    spleeter_arg = request.files["settings"]

    path_to_temp_file = tempfile.mkstemp(dir=audio_path)[1]

    token = os.path.basename(path_to_temp_file)

    with open(path_to_temp_file, mode='wb') as file:
        file.write(audio_bytes)

    processing_queue[token] = mp.Process(target=separate_audio,
                                         args=(path_to_temp_file, res_path,
                                               spleeter_arg, token,
                                               paths_token))

    processing_queue[token].start()

    return jsonify(value=token)


@app.route('/process/<token>')
def process_token(token):
    """Return json stating if files with associated token are available."""
    return jsonify(isAvailable=is_available(token))


@app.route('/download/<token>')
def retrieve(token):
    """Send file for download."""
    if os.path.isfile(paths_token[token]):
        return send_file(paths_token[token], mimetype='application/zip')
    # should return something else if not os.path.isfile(paths_token[token])


if __name__ == '__main__':
    app.run(port=5003)
