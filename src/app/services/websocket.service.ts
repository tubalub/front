import { Injectable } from '@angular/core';
import { CompatClient } from '@stomp/stompjs/esm6/compatibility/compat-client';
import { Stomp } from '@stomp/stompjs/esm6/compatibility/stomp';
import { Observable, of, Subject } from "rxjs";
import { environment } from '../../environments/environment';
import { MusicSyncInfo } from '..//models/music-sync-info';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  public syncInfo = new Subject<MusicSyncInfo>();
  stompClient: CompatClient;

  constructor(private data:DataService) { 
    this.initConnection();
  }

  initConnection() {
    let ws = new WebSocket(`ws://${environment.BACKEND_URL}/connect`);
    this.stompClient = Stomp.over(ws);

    this.stompClient.connect({}, frame => {
      this.stompClient.subscribe('/topic/music', message => {
        if (message.body) {
          console.log("Response:" + message.body);
          this.syncInfo.next(JSON.parse(message.body));
        }
      })
    });
  }

  send(msg: MusicSyncInfo) {
    this.stompClient.send('/app/update', {}, JSON.stringify(msg));
  }

}
