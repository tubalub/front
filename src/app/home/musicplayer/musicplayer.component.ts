import { Component, OnInit } from '@angular/core';
import { MusicSyncInfo } from '../../models/music-sync-info';
import { WebsocketService } from '../../services/websocket.service'
import { ParserService } from '../../services/parser.service'
import { DataService } from '../../services/data.service'
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-musicplayer',
  templateUrl: './musicplayer.component.html',
  styleUrls: ['./musicplayer.component.css'],
})
export class MusicplayerComponent implements OnInit {
  nowPlaying = new Audio();
  timeString = "00:00.0";
  host = null;

  // youtube related
  apiLoaded = false;
  youtubeID = null;

  constructor(private wsService: WebsocketService, 
    private parser: ParserService, 
    public data: DataService, 
    private http: HttpClient) {}

  async ngOnInit() {
    this.initSync();

    // Init Youtube player
    // This code loads the IFrame Player API code asynchronously, according to the instructions at
    // https://developers.google.com/youtube/iframe_api_reference#Getting_Started
    if (!this.apiLoaded) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      this.apiLoaded = true;
    }

    // Listeners for when song ends
    this.nowPlaying.addEventListener("ended", () => {
      this.nowPlaying.currentTime = 0;
      this.next();
    });

    // Subscribe to changes in sync info from data service class
    // Allows changes to propagate via onChange
    this.data.musicSubj.subscribe((sync) => {
      this.onChange(sync);
    });

    // Function to display current timestamp
    setInterval(() => {this.timeUpdater(this.nowPlaying)}, 100);
  }

  // gets sync info from backend and starts playing
  async initSync() {
    this.data.syncInfo = await this.http.get<MusicSyncInfo>(`http://${environment.BACKEND_URL}/sync`).toPromise();
    let currentSong = this.data.syncInfo.songQ[0];
    if (currentSong) {
      this.host = this.parser.getSource(currentSong);
      switch(this.host) {
        case "FILE":
          this.playFile();
        break;
        case "YOUTUBE":
          this.youtubeID = this.parser.getYoutubeID(currentSong);
        break;

        default:

      }

    }
  }

  // Keep this for future features that require different logic for manual skips
  // e.x vote skip, displaying user actions (i.e. "Bob skipped song x")
  skip() {
    this.next();
  }

  // Plays next song in songQ
  next(): void {
    let source = this.data.syncInfo.songQ[0];
    if (source) {
      this.host = this.parser.getSource(source);
      this.data.syncInfo.history.push(this.data.syncInfo.songQ.shift());

      switch(this.host) {
        case "FILE":
          this.playFile();
        break;
        case "YOUTUBE":
          // TODO
        break;

        default:

      }

      this.updateBackend();

    }
  }

  // Function to be called when sync info is updated from backend
  onChange(sync: MusicSyncInfo) {
    // edge case when last song finishes playing
    if (this.data.syncInfo.songQ.length == 0) {
      this.nowPlaying.src = undefined;
      this.nowPlaying.currentTime = 0;
    // otherwise, if we need to switch songs
    } else if (decodeURIComponent(this.nowPlaying.src) != this.data.syncInfo.songQ[0]) {
      this.playFile();
    }
  }

  playFile() {
    this.nowPlaying.src = this.data.syncInfo.songQ[0];
    this.nowPlaying.currentTime = this.data.syncInfo.time;
    this.nowPlaying.play();
  }

  updateBackend() {
    this.data.syncInfo.time = this.nowPlaying.currentTime;
    this.wsService.sendMusicInfo(this.data.syncInfo);
  }

  toggleMute() {
    this.nowPlaying.muted = !this.nowPlaying.muted;
  }

  timeUpdater(audio: HTMLAudioElement) {
    if (audio.src) {
      let time = new Date(0);
      time.setMilliseconds(this.nowPlaying.currentTime*1000);
      this.timeString = time.toISOString().substr(14,7);
    }
  }

}
