import { Component, OnInit } from '@angular/core';
import { MusicSyncInfo } from '../models/music-sync-info';
import { WebsocketService } from '../services/websocket.service'
import { HostparserService } from '../services/hostparser.service'

@Component({
  selector: 'app-musicplayer',
  templateUrl: './musicplayer.component.html',
  styleUrls: ['./musicplayer.component.css'],
})
export class MusicplayerComponent implements OnInit {
  nowPlaying = new Audio();
  songQ = [
    // temporary
    "https://tubalub.s3.amazonaws.com/123.mp3", 
    "https://tubalub.s3.amazonaws.com/abc.mp3",
    "https://www.youtube.com/watch?v=grng80hJM5A"
  ];
  history = [];
  playing = false;
  index = 0;

  constructor(private wsService: WebsocketService, private parser: HostparserService) {}

  ngOnInit(): void {
    this.nowPlaying.addEventListener("ended", () => {
      this.nowPlaying.currentTime = 0;
      this.skip();
    })
  }

  play(): void {
    this.playing = !this.playing
    if (!this.nowPlaying.src) {
      let link = this.songQ.shift();
      this.history.push(link);
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
    let source = this.songQ.shift()
    this.history.push(source);
    if (source) {
      this.nowPlaying.src = source
      this.nowPlaying.play()
    };
    this.index++;
    this.wsService.send(this.createSyncInfo());
  }

  createSyncInfo(): MusicSyncInfo {
    return new MusicSyncInfo(this.songQ[this.index], this.index, this.playing, this.songQ, this.history);
  } 

  test() {
    console.log("songQ:" + this.songQ);
    console.log("index:" + this.index);
    console.log("history:" + this.history);
    console.log(this.songQ[this.index]);
    this.parser.getSource(this.songQ[this.index]);
    this.wsService.test();
  }

  add(link: string): void {
    this.songQ.push(link)

    console.log(this.songQ)
  }
}
