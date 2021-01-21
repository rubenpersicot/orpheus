import { Component, OnInit, Input } from '@angular/core';
import { RecordingService } from '../recording.service';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-creations',
  templateUrl: './creations.component.html',
  styleUrls: ['./creations.component.css'],
})
export class CreationsComponent implements OnInit {
  constructor(private recordingService: RecordingService, private domSanitizer: DomSanitizer) {}

  ngOnInit(): void {}

  text2print = "grospd";
  token = "tmp4uajo6n4";
  urlFile


  getVocal(){
  	this.recordingService.getResponse(this.token).subscribe( answer => console.log(answer["isAvailable"]) );
  }

  downloadFile() {
  	
  		this.recordingService.getZipFile(this.token).subscribe( answer => {const blob = new Blob([answer], {type: 'application/zip'}); this.urlFile = URL.createObjectURL(blob); window.open(this.urlFile); } );
      return this.domSanitizer.bypassSecurityTrustResourceUrl(this.urlFile);

}
}