import { Component, OnInit } from '@angular/core';
import { MusicSyncInfo } from '../models/music-sync-info';
import { WebsocketService } from '../services/websocket.service'
import { HostparserService } from '../services/hostparser.service'
import { DataService } from '../services/data.service'
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-musicplayer',
  templateUrl: './musicplayer.component.html',
  styleUrls: ['./musicplayer.component.css'],
})
export class MusicplayerComponent implements OnInit {
  nowPlaying = new Audio();

  constructor(private wsService: WebsocketService, private parser: HostparserService, public data: DataService, private http: HttpClient) {}

  ngOnInit(): void {
    this.initSync();
    console.log(this.data.syncInfo);
    this.nowPlaying.addEventListener("ended", () => {
      this.nowPlaying.currentTime = 0;
      this.next();
    });
    this.wsService.syncInfo.subscribe((sync) => {
      this.onChange(sync);
    });
    this.nowPlaying.play();
  }

  async initSync() {
    this.data.syncInfo = await this.http.get<MusicSyncInfo>(`http://${environment.BACKEND_URL}/sync`).toPromise();
  }

  // play(): void {
  //   if (!this.nowPlaying.src) {
  //     let link = this.data.syncInfo.songQ.shift();
  //     this.data.syncInfo.history.push(link);
  //     let source = this.parser.getSource(link);
  //     if (source == "FILE") {
  //       this.nowPlaying.src = link;
  //       this.nowPlaying.load();
  //       this.nowPlaying.play();
  //     } 
  //   } 
  //   this.updateBackend();
  // }

  skip() {
    this.nowPlaying.pause();
    this.nowPlaying = new Audio();
    this.next();
  }

  next(): void {
    this.data.syncInfo.history.push(this.data.syncInfo.songQ.shift());
    let source = this.data.syncInfo.songQ[0];
    if (source) {
      this.nowPlaying.src = source
      this.nowPlaying.play()
    };
    this.updateBackend();
  }

  onChange(sync: MusicSyncInfo) {
    this.data.syncInfo = sync;
    console.log("Now playing source: " + this.nowPlaying.src);
    console.log(this.data.syncInfo);
    if (!this.nowPlaying.src) {
      console.log("Playing...")
      this.nowPlaying.src = sync.songQ[0];
      this.nowPlaying.currentTime = sync.time;
      this.nowPlaying.play();
    }
  }

  updateBackend() {
    this.data.syncInfo.time = this.nowPlaying.currentTime;
    console.log(this.data.syncInfo);
    this.wsService.send(this.data.syncInfo);
  }
}
