import { Component, OnInit } from '@angular/core';
import { MusicSyncInfo } from '../models/music-sync-info';
import { WebsocketService } from '../services/websocket.service'
import { HostparserService } from '../services/hostparser.service'
import { DataService } from '../services/data.service'

@Component({
  selector: 'app-musicplayer',
  templateUrl: './musicplayer.component.html',
  styleUrls: ['./musicplayer.component.css'],
})
export class MusicplayerComponent implements OnInit {
  nowPlaying = new Audio();
  playing = false;

  constructor(private wsService: WebsocketService, private parser: HostparserService, public data: DataService) {}

  ngOnInit(): void {
    this.nowPlaying.addEventListener("ended", () => {
      this.nowPlaying.currentTime = 0;
      this.skip();
    })
  }

  play(): void {
    this.playing = !this.playing
    if (!this.nowPlaying.src) {
      let link = this.data.songQ.shift();
      this.data.history.push(link);
      let source = this.parser.getSource(link);
      if (source == "FILE") {
        this.nowPlaying.src = link;
        this.nowPlaying.load();
        this.nowPlaying.play();
      } 
    } 
    this.wsService.send(this.createSyncInfo());
  }

  pause(): void {
    this.playing = !this.playing
    this.nowPlaying.pause()
    console.log("playing = " + this.playing);
    this.wsService.send(this.createSyncInfo());
  }

  skip(): void {
    let source = this.data.songQ.shift()
    this.data.history.push(source);
    if (source) {
      this.nowPlaying.src = source
      this.nowPlaying.play()
    };
    this.wsService.send(this.createSyncInfo());
  }

  createSyncInfo(): MusicSyncInfo {
    return new MusicSyncInfo(this.nowPlaying.currentTime, this.playing, this.data.songQ, this.data.history);
  } 

  test() {
    console.log("songQ:" + this.data.songQ);
    console.log("history:" + this.data.history);
    this.wsService.test();
  }

  // add(link: string): void {
  //   this.data.songQ.push(link)

  //   console.log(this.data.songQ)
  // }
}
