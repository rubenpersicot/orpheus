import { Injectable } from '@angular/core';
import { Recording } from './recording';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RecordingService {

  constructor(private http: HttpClient) { }

  testString: JSON;
  url: string = "http://127.0.0.1:5002/"
  processUrl: string = "http://127.0.0.1:5002/process"

  getStringFromServer(): Observable<JSON>{
  	return this.http.get<JSON>(this.url);
  }

  sendStringToServer(text2send: string): Observable<JSON>{
  	
  	

  	return this.http.post<JSON>(this.url, JSON.parse('{"value":true}') );
  }

  /** POST : push a recording to be processed */

  pushRecording(recording: Recording): Observable<JSON> {

  	const httpOptions = {
  		headers: new HttpHeaders({
  			'Content-Type': 'multipart/form-data'
  		})
  	}

  	var fd = new FormData();

  	fd.append("audio_data", recording["data"])

  	return this.http.post<JSON>(this.processUrl, fd)
  }


}
