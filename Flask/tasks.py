from celery import Celery
import os.path
import os
import tempfile
from spleeter.separator import Separator

app = Celery('task', broker='pyamqp://guest@localhost//')

@app.task
def separateAudio(pathname, spleeter_argument):

	separator = Separator(spleeter_argument)	
	separator.separate_to_file(pathname, audio_path, synchronous=False)

	