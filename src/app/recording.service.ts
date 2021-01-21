import { Injectable } from '@angular/core';
import { Recording } from './recording';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RecordingService {
  constructor(private http: HttpClient) {}

  testString: JSON;
  url = 'http://127.0.0.1:5003/';
  processUrl = 'http://127.0.0.1:5003/process';
  downloadUrl = 'http://127.0.0.1:5003/download';
  /** POST :D push a recording to be processed */

  pushRecording(record: Recording): Observable<JSON> {
    const fd = new FormData();

    fd.append('audio_data', record['data']);

    const spleeterArg: string = "spleeter:"+  record['stems'] + record['cutoff'];

    fd.append('settings', spleeterArg);

    return this.http.post<JSON>(this.processUrl, fd);
  }

  getResponse(token): Observable<JSON> {

    const tokenUrl = this.processUrl + "/" + token;

    return this.http.get<JSON>(tokenUrl);
  }

  getZipFile(token): Observable<ArrayBuffer> {

    const httpOptionsZip = {headers: new HttpHeaders().set('content-type', 'application/zip')}

    const zipUrl = this.downloadUrl + "/" +token;

    console.log("pouet")

    return this.http.get<ArrayBuffer>(zipUrl,  httpOptionsZip);
  }

}
