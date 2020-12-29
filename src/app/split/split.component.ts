import { Component, OnInit } from '@angular/core';
import * as RecordRTC from 'RecordRTC';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-split',
  templateUrl: './split.component.html',
  styleUrls: ['./split.component.css']
})


export class SplitComponent implements OnInit {

	private record;

	public recording = false;

	private error;

	public recordingDone = false;

	public url;

	public fileUrl;

  constructor(private domSanitizer: DomSanitizer) { 
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
  	this.url = URL.createObjectURL(blob);
  	this.fileUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
  }


  ngOnInit(): void {
  }



}
