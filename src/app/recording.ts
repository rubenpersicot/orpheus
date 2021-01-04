export interface Recording {
	id : number;
	name : string;
	url : string;
	data: Blob;
	toSend: boolean;
}