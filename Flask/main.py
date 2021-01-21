from flask import Flask, request, send_file, jsonify
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from tasks import separateAudio
import tempfile
from spleeter.separator import Separator
import multiprocessing as mp 



import os
currentpath = os.path.dirname(os.path.abspath(__file__))
audio_path = currentpath + "/tmp/audio/"

print(currentpath)



app = Flask(__name__)
api = Api(app)

CORS(app)

def isAvailable(token):
	'''Check if the files associated to this token exists
	
	Arguments:
		token {[string]} -- [the file's token]
	
	Returns:
		[bool] -- [true if exist, false otherwise]
	'''
	return os.path.isdir(audio_path + token)

def separateAudio(pathname, spleeter_argument):
	separator = Separator("spleeter:2stems")	
	separator.separate_to_file(pathname, audio_path, synchronous=False)

@app.route('/process', methods = ['GET', 'POST'])
def process():
	if (request.method == 'POST'):
		audio_data = request.files["audio_data"]
		audio_bytes = audio_data.read()
		token = ''

		currentpath = os.path.dirname(os.path.abspath(__file__))
		audio_path = currentpath+'/tmp/audio'

		temp, pathname = tempfile.mkstemp(dir=audio_path)

		# pathname : path to the direct byte file
		# audio_path : path to the foler containing all folders where processing is done
		# token : the name of the byte file
		# then audio_path + "/" + token = path to folder where the processing is done for the token file. 

		with open(pathname, mode='wb') as f:
		 	f.write(audio_bytes)

		p = mp.Process(target=separateAudio, args=(pathname,"spleeter:2stems"))
		p.start()

		token = os.path.basename(pathname)

		

		
		
		return jsonify(value=token)

@app.route('/process/<token>')
def process_token(token):
	if(request.method == 'GET'):
		print(token)
		print(audio_path+token)
		print(isAvailable(token))
		return jsonify(isAvailable=isAvailable(token))

@app.route('/download/<token>')
def retrieve(token):
	if(request.method == 'GET'):
		zipFile = audio_path+token+'/results.zip'
		if os.path.isfile(zipFile):
			return send_file(zipFile, mimetype = 'application/zip')







if __name__ == '__main__':
   app.run(port=5002)
   mp.set_start_method('spawn')
   q = mp.Queue()


