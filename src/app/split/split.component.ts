/**
 * Author : Louis Reine
 * Latest Update : 17 January 2021
 * Much love
 */

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
  /**
   * stemOptions & stemText : Used to control the drop down menu for selecting options. stemOptions is the part of the string that will be used in spleeter to run default separator settings
   * cutoffOptions & cutoffText : Same as stemOptions & stemText
   * record : current recording, used to record the voice with RecordRTC. It is then used to construct a Recording object
   * isRecording : is the recording running ?
   * error : error handling, need some improvement
   * recordArray : array of Recordings, holds the data to let the user hear it before sending it
   */

  private stemOptions = ['2stems', '4stems', '5stems'];

  private stemText = {
    '2stems': '2 stems : Vocals + Accompaniement',
    '4stems': '4 stems : Vocal + Drums + Bass + Accompaniement',
    '5stems': '5 stems : Vocal + Drum + Bass + Piano + Accompaniement',
  };

  private cutoffOptions = ['', '-16kHz'];

  private cutoffText = { '': '11kHz', '-16kHz': '16kHz' };

  private record: any;

  public isRecording: boolean = false;

  private error: DOMException;

  public recordArray: Recording[] = [];

  constructor(
    private domSanitizer: DomSanitizer,
    private recordingService: RecordingService
  ) {}

  sanitize(url: string): any {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  /**
   * Launch the recording of the audio. It uses the getUserMedia function, producing a MediaStream object, starting the recording.
   * We pass the argument mediaConstraints which configures the recording process.
   * .then allows error handling using Promise Object
   */

  initiateRecording(): void {
    this.isRecording = true;
    const mediaConstraints = {
      video: false,
      audio: true,
    };
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.sucessCallback.bind(this), this.errorCallback.bind(this));
  }

  /**
   * If there is no issues, create a stream and strart streaming
   * @param stream - MediaStream ensuring local streaming process
   */

  sucessCallback(stream: MediaStream): void {
    const options = {
      mimeType: 'audio/wav',
      numberOfAudioChannels: 1,
    };

    const StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(stream, options);
    this.record.record();
  }

  errorCallback(error: DOMException): void {}

  /**
   * Stop the recording, calls processRecording at the end to create the Recording Object.
   *
   */
  stopRecording(): void {
    this.isRecording = false;
    this.record.stop(this.processRecording.bind(this));
  }

  /**
   * Creating the Recording Object to be pushed.
   * @param {Blob} blob wav binary file. For now we only used 1 channel setups, but it might need a rework for multiple channel devices. Also here the default sampling frequency is 44100Hz so no frequency fields.
   */
  processRecording(blob: Blob): void {
    const recordEntree: Recording = {
      id: Date.now(),
      name: 'recording_' + Date.now().toString(),
      url: URL.createObjectURL(blob),
      data: blob,
      stems: '2stems',
      cutoff: '',
    };

    this.recordArray.push(recordEntree);
  }

  /**
   * Allowing the user to download his dry recording. Creates a safe Url to access the local Blob and puts it in a wav format.
   * @param  {Recording} record
   * @return {any}       The type here is any because I couldn't make it work with SafeResourceUrl...
   */
  downloadRecordingFile(record: Recording): any {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(
      URL.createObjectURL(record.data)
    );
  }

  /**
   * Retrieve the token from the server when a recording has been pushed. This token is then used to access the separated audio (/process/<token_id>)
   * Error Handling should be added.
   * @param {Recording} record recording to be pushed
   */
  getProcessingToken(record: Recording): void {
    this.recordingService
      .pushRecording(record)
      .subscribe((token) => this.handleToken(record, token));
  }

 
  /**
   * Process the token with simple error handling for now. Puts the token in the record interface.
   * @param {Recording} record recording associated to the token
   * @param {JSON}      token  json use to retrieve the token to find separated sources in the server.
   */
  handleToken(record: Recording, token: JSON): void {
    if (Object.keys(token).includes('value')) {
      record['token'] = token['value'];
    } else {
      console.log('Error, was not able to see key value in token');
    }
  }


  downloadSeparatedFiles(record: Recording, token: string): any {
    console.log(token)
    this.recordingService.getZipFile(token).subscribe( (data) => this.getZipFile(data))
  }

  getZipFile(data: any) {
    console.log("pouet")
  }

  ngOnInit(): void {}
}
