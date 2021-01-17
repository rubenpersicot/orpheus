"""Backend of the app."""
import os
import tempfile
from flask import Flask, request, send_file
from flask_cors import CORS
from flask_restful import Api
from spleeter.separator import Separator

current_path = os.path.dirname(os.path.abspath(__file__))
audio_path = current_path + "/tmp/audio"

app = Flask(__name__)
api = Api(app)

CORS(app)


@app.route("/process", methods=['GET', 'POST'])
def retrieve():
    """Create separator and return associated token."""
    # To be modified to create a token and associate it?
    if request.method == 'POST':
        audio_data = request.files["audio_data"]
        number_of_stems = request.form["stems"]

        audio_bytes = audio_data.read()
        path_name = tempfile.mkstemp()[1]

        with open(path_name, mode='wb') as file:
            file.write(audio_bytes)

        separate_command = 'spleeter:' + number_of_stems + 'stems'
        separator = Separator(separate_command)
        separator.separate_to_file(path_name, audio_path)

        separated_audio_location = os.path.basename(os.path.normpath(path_name))
        vocals_path = audio_path + '/' + separated_audio_location + '/vocals.wav'

        response = send_file(vocals_path)
        return response  # should return token to be created...
    return False  # just for pylint, need to return something at all times


@app.route('/process/<int:token')
def send_audio():
    """Send audio to the frontend."""
    # how to come back to vocals_path in a nice way??
    return True  # again, just to return something for pylint


if __name__ == '__main__':
    app.run(port=5002)
