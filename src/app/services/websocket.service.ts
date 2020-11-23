import { Injectable } from '@angular/core';
import { CompatClient } from '@stomp/stompjs/esm6/compatibility/compat-client';
import { Stomp } from '@stomp/stompjs/esm6/compatibility/stomp';
import { environment } from '../../environments/environment';
import { MusicSyncInfo } from '..//models/music-sync-info';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  stompClient: CompatClient;

  constructor() { 
    this.initConnection();
  }

  initConnection() {
    let ws = new WebSocket(`ws://${environment.BACKEND_URL}/connect`);
    console.log(ws)
    this.stompClient = Stomp.over(ws);
    console.log(this.stompClient)

    this.stompClient.connect({}, frame => {
      console.log("frame:" + frame);
      this.stompClient.subscribe('/topic/music', message => {
        if (message.body) {
          console.log("Response:" + message.body);
          //let syncInfo = JSON.parse(message.body);
        }
      })
    });
  }

  send(msg: MusicSyncInfo) {
    this.stompClient.send('/app/update', {}, JSON.stringify(msg));
  }

  test() {
    this.stompClient.send("/app/test", {}, "abc123");
  }

}
