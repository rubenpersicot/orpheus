/**
 * id : a local ID
 * name : a local name
 * url : a local unaccessible url
 * data : a blob containing the wav file
 * stems : defines how much stems this recording will be split into
 * cutoff : defines the cutoff frequency used to isolate vocals
 * token : attributes to get to the processed waves files
 */
export interface Recording {
  readonly id: number;
  name: string;
  url: string;
  data: Blob;
  stems: string;
  cutoff: string;
  token?: string;
}
