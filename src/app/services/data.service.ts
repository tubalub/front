import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // public songQ:string[] = [];
  // public history:string[] = [];
  songQ = [
    // temporary
    "https://tubalub.s3.amazonaws.com/123.mp3", 
    "https://tubalub.s3.amazonaws.com/abc.mp3",
    "https://www.youtube.com/watch?v=grng80hJM5A"
  ];
  history = [];

  constructor() { }
}
