import { Component, OnInit } from '@angular/core';
import * as RecordRTC from 'RecordRTC';
import { DomSanitizer } from '@angular/platform-browser';
import { Recording } from '../recording';
import { RecordingService } from '../recording.service';


@Component({
  selector: 'app-split',
  templateUrl: './split.component.html',
  styleUrls: ['./split.component.css']
})


export class SplitComponent implements OnInit {

	private record;

	public recording = false;

	private error;

	private recordingDone = false;

  public recordArray: Recording[] = [];

  public sendArray : boolean[];

  constructor(private domSanitizer: DomSanitizer, private recordingService: RecordingService ) { 
  }

  sanitize(url:string){
  	return this.domSanitizer.bypassSecurityTrustUrl(url);
  }


  initiateRecording() {
  	this.recording = true;
  	let mediaConstraints = {
  		video: false,
  		audio: true
  	};
  	navigator.mediaDevices.getUserMedia(mediaConstraints).then(this.sucessCallback.bind(this),this.errorCallback.bind(this)) ;
  }

  stopRecording() {
  	this.recording = false;
  	this.record.stop(this.processRecording.bind(this));
  	this.recordingDone = true;
  }

  sucessCallback(stream) {
  	var options = {
  		mimeType: "audio/wav",
  		numberOfAudioChannels:1
  	};

  	var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
  	this.record = new StereoAudioRecorder(stream, options);
  	this.record.record();
  }

  errorCallback(error){
  	this.error = 'Can not play audio in your browser';
  }

  processRecording(blob) {
    let recordEntree: Recording = {
      id: Date.now(),
      name: 'recording_'+Date.now().toString(),
      url: URL.createObjectURL(blob),
      data: blob,
      toSend: false
    };

    this.recordArray.push(recordEntree);

  }

  downloadRecordingFile(record: Recording){

    return this.domSanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(record.data));

  }

  getProcessingToken(recording: Recording){
    this.recordingService.pushRecording(recording).subscribe( (_) => console.log("Sent !"));
  }


  ngOnInit(): void {
  }



}
