import { Component, OnInit, Input } from '@angular/core';
import { RecordingService } from '../recording.service'

@Component({
  selector: 'app-creations',
  templateUrl: './creations.component.html',
  styleUrls: ['./creations.component.css']
})
export class CreationsComponent implements OnInit {

  constructor(private recordingService: RecordingService) { }


  dataFromServer: JSON;
  toprint: string = "nothing there";
  tosend: string = "It ain't much, but it's honest work!";


  getData(): void{
  	this.recordingService.getStringFromServer()
  		.subscribe(data => this.dataFromServer = data);
  }

  ngOnInit(): void {
  	this.getData();
  }

  printSucess(): void{
    this.toprint = this.dataFromServer['text'];
  }

  pushData(): void{
    this.recordingService.sendStringToServer(this.tosend).subscribe(data => this.dataFromServer = data);
  }

}
