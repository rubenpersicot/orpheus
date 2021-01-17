import { Component, OnInit } from '@angular/core';
import * as RecordRTC from 'RecordRTC';
import { DomSanitizer } from '@angular/platform-browser';
import { Recording } from '../recording';
import { RecordingService } from '../recording.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-split',
  templateUrl: './split.component.html',
  styleUrls: ['./split.component.css'],
})

export class SplitComponent implements OnInit {

  private stemOptions = ['2stems','4stems','5stems'];

  private stemText = {"2stems" : '2 stems : Vocals + Accompaniement', "4stems" : '4 stems : Vocal + Drums + Bass + Accompaniement', "5stems" : '5 stems : Vocal + Drum + Bass + Piano + Accompaniement'};

  private cutoffOptions = ['','16kHz'];

  private cutoffText = {"" : '11kHz', "16kHz" : '-16kHz'};

  private record: any;

  public recording: boolean = false;

  private error: DOMException;

  private recordingDone: boolean = false;

  public recordArray: Recording[] = [];

  public sendArray: boolean[];

  constructor(
    private domSanitizer: DomSanitizer,
    private recordingService: RecordingService,
  ) {}

  sanitize(url: string): any {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  initiateRecording(): void {
    this.recording = true;
    const mediaConstraints = {
      video: false,
      audio: true,
    };
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.sucessCallback.bind(this), this.errorCallback.bind(this));
  }

  stopRecording(): void {
    this.recording = false;
    this.record.stop(this.processRecording.bind(this));
    this.recordingDone = true;
  }

  sucessCallback(stream: MediaStream): void {
    const options = {
      mimeType: 'audio/wav',
      numberOfAudioChannels: 1,
    };

    const StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(stream, options);
    this.record.record();
  }

  errorCallback(error : DOMException): void {
  }

  processRecording(blob: Blob): void {
    const recordEntree: Recording = {
      id: Date.now(),
      name: 'recording_' + Date.now().toString(),
      url: URL.createObjectURL(blob),
      data: blob,
      stems: '2stems',
      cutoff:  '',
    };

    this.recordArray.push(recordEntree);
  }

  changeStems(record: Recording, selectedStem: string): void {
    console.log(selectedStem);
    console.log(this.recordArray);
  }

  downloadRecordingFile(record: Recording): any {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(
      URL.createObjectURL(record.data)
    );
  }

  getProcessingToken(record: Recording): void {
    this.recordingService
      .pushRecording(record)
      .subscribe( token => record["token"] = token["value"]);
  }

  handleToken(record : Recording, token : JSON){
    if (Object.keys(token).includes("value")){
      record["token"] = token["value"];  
    }
  }

  ngOnInit(): void {}

}
