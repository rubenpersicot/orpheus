from flask import Flask, request, send_file
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from json import dumps
from flask_jsonpify import jsonify
import wave 
import tempfile
from spleeter.separator import Separator

import os
currentpath = os.path.dirname(os.path.abspath(__file__))
audio_path = currentpath + "/tmp/audio"

print(currentpath)



app = Flask(__name__)
api = Api(app)

CORS(app)

@app.route("/process", methods = ['GET', 'POST'])
def retrieve():
	if (request.method == 'POST'):

		audio_data = request.files["audio_data"]
		audio_bytes = audio_data.read()
		temp, pathname = tempfile.mkstemp()
		print(pathname)

		with open(pathname, mode='wb') as f:
		 	f.write(audio_bytes)

		separator = Separator('spleeter:2stems')	
		separator.separate_to_file(pathname, audio_path)

		separated_audio_location = os.path.basename(os.path.normpath(pathname))

		vocalsPath = audio_path+"/"+separated_audio_location+"/vocals.wav"	 

		print(vocalsPath)

		response = send_file(vocalsPath)
		
		return response

if __name__ == '__main__':
   app.run(port=5002)