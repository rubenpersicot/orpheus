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
  url = 'http://127.0.0.1:5002/';
  processUrl = 'http://127.0.0.1:5002/process';

  /** POST :D push a recording to be processed */

  pushRecording(record: Recording): Observable<JSON> {
    const fd = new FormData();

    fd.append('audio_data', record['data']);

    const spleeterArg: string = record['stems'] + record['cutoff'];

    fd.append('settings', spleeterArg);

    return this.http.post<JSON>(this.processUrl, fd);
  }
}
