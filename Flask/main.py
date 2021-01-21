from flask import Flask, request, send_file, jsonify
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from tasks import separateAudio
import tempfile
from spleeter.separator import Separator
import multiprocessing as mp 
import zipfile

import os

currentpath = os.path.dirname(os.path.abspath(__file__))
audio_path = currentpath + "/tmp/audio/"
res_path = currentpath + "/tmp/res_process/"
zip_path = currentpath + "/tmp/zip/"

print(currentpath)



app = Flask(__name__)
api = Api(app)

CORS(app)

PathManager = mp.Manager()

processing_queue = {}

paths_token = PathManager.dict()

def isAvailable(token):
	'''Check if the files associated to this token exists
	
	Arguments:
		token {[string]} -- [the file's token]
	
	Returns:
		[bool] -- [true if exist, false otherwise]
	'''
	if processing_queue:
		return processing_queue[token].is_alive()
	return True

def zipdir(path, ziph):
    # ziph is zipfile handle
    print(path)
    for root, dirs, files in os.walk(path):
        for file in files:
            ziph.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), os.path.join(path, '..')))

def separateAudio(path_to_audio_file, path_to_ouput_directory, spleeter_argument, token, paths_token):
	separator = Separator("spleeter:2stems")	
	separator.separate_to_file(path_to_audio_file, res_path, synchronous=True)

	path_to_output_zip_file = zip_path+f'{token}.zip'
	paths_token[token] = path_to_output_zip_file
	print(path_to_output_zip_file)

	zipf = zipfile.ZipFile(path_to_output_zip_file, 'w', zipfile.ZIP_DEFLATED)
	zipdir(res_path+token, zipf)

	




		# path_to_audio_file : path to the direct byte file
		# audio_path : path to the foler containing all folders where processing is done
		# token : the name of the byte file
		# then audio_path + "/" + token = path to folder where the processing is done for the token file. 


@app.route('/process', methods = ['GET', 'POST'])
def process():
	if (request.method == 'POST'):
		audio_data = request.files["audio_data"]
		audio_bytes = audio_data.read()
		token = ''

		print("ok")

		temp_os_object, path_to_temp_file = tempfile.mkstemp(dir=audio_path) # placing the file in the audio folder

		token = os.path.basename(path_to_temp_file)
		
		with open(path_to_temp_file, mode='wb') as f:
		 	f.write(audio_bytes)
		
		processing_queue[token] = mp.Process(target=separateAudio, args=(path_to_temp_file, res_path, "spleeter:2stems", token, paths_token)) # Separating the tempfile in the res_process folder and zipping it to the zip folder

		print(processing_queue)

		processing_queue[token].start()


		return jsonify(value=token)

@app.route('/process/<token>')
def process_token(token):
	if(request.method == 'GET'):
		
		return jsonify(isAvailable=isAvailable(token))

@app.route('/download/<token>')
def retrieve(token):
	if(request.method == 'GET'):
		if os.path.isfile(paths_token[token]):
			return send_file(paths_token[token], mimetype = 'application/zip')







if __name__ == '__main__':
   app.run(port=5003)


