import { Injectable } from '@angular/core';
import { CompatClient } from '@stomp/stompjs/esm6/compatibility/compat-client';
import { Stomp } from '@stomp/stompjs/esm6/compatibility/stomp';
import { environment } from '../../environments/environment';
import { MusicSyncInfo } from '..//models/music-sync-info';
import { DataService } from './data.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  stompClient: CompatClient;
  ws:WebSocket;

  constructor(private data:DataService) { 
  }

  initConnection(username:string): WebSocket {
    let ws = new WebSocket(`ws://${environment.BACKEND_URL}/connect`);
    this.stompClient = Stomp.over(ws);

    this.stompClient.connect({"username":username}, frame => {
      this.stompClient.subscribe('/topic/music', message => {
        if (message.body) {
          this.data.musicSubj.next(JSON.parse(message.body));
        }
      });
      this.stompClient.subscribe('/topic/users', message => {
        if (message.body) {
          this.data.userSubj.next(JSON.parse(message.body));
        }
      });
    });
    return ws;
  }

  sendMusicInfo(msg: MusicSyncInfo) {
    this.stompClient.send('/app/update', {}, JSON.stringify(msg));
  }
}
