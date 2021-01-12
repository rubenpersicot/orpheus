from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from json import dumps
from flask_jsonpify import jsonify
import wave 
import tempfile


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

		with open(pathname+".wav", mode='wb') as f:
		 	f.write(audio_bytes)

		return jsonify({'text':'ok'})



if __name__ == '__main__':
   app.run(port=5002)