import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MusicSyncInfo } from '../../models/music-sync-info';
import { WebsocketService } from '../../services/websocket.service';
import { ParserService } from '../../services/parser.service';
import { DataService } from '../../services/data.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { YouTubePlayer } from '@angular/youtube-player';

@Component({
  selector: 'app-musicplayer',
  templateUrl: './musicplayer.component.html',
  styleUrls: ['./musicplayer.component.css'],
})
export class MusicplayerComponent implements OnInit {

  // file
  filePlayer = new Audio();
  timeString = '00:00.0';
  host = null;
  isMuted: boolean = false;

  // used to track if changes are uploads or skips/nexts
  qSize:number = 0;
  totalSize: number = 0;

  // youtube related
  @ViewChild('ytElement') ytPlayer: YouTubePlayer;
  ytPlayerVars = {
    autoplay: 1,
    controls: 0,
    enablejsapi: 1,
    muted: 1,
    modestbranding: 1,
  };
  apiLoaded = false;
  youtubeID = null;

  constructor(
    private wsService: WebsocketService,
    private parser: ParserService,
    public data: DataService,
    private http: HttpClient
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    
  }

  async ngAfterViewInit() {
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
    this.filePlayer.addEventListener('ended', () => {
      this.filePlayer.currentTime = 0;
      this.next();
    });

    // Subscribe to changes in sync info from data service class
    // Allows changes to propagate via onChange
    this.data.musicSubj.subscribe(() => {
      this.onChange();
    });

    // Function to display current timestamp
    setInterval(() => {
      this.timeUpdater();
    }, 100);

    console.log(this.ytPlayer);
  }

  // gets sync info from backend and starts playing
  async initSync() {
    this.data.syncInfo = await this.http
      .get<MusicSyncInfo>(`http://${environment.BACKEND_URL}/sync`)
      .toPromise();
    let currentSong = this.data.syncInfo.songQ[0];
    this.qSize = this.data.syncInfo.songQ.length;
    this.totalSize = this.data.syncInfo.songQ.length + this.data.syncInfo.history.length; 
    if (currentSong) {
      this.host = this.parser.getSource(currentSong);
      this.play(this.host);
    }
  }

  // Keep this for future features that require different logic for manual skips
  // e.x vote skip, displaying user actions (i.e. "Bob skipped song x")
  skip() {
    console.log("skip called");
    this.next();
  }

  next(): void {
    // stop currently playing song
    this.stopPlayback();

    if (this.data.syncInfo.songQ[0]) {
      this.data.syncInfo.history.push(this.data.syncInfo.songQ.shift());
      let source = this.data.syncInfo.songQ[0];
      if (source) {
        this.host = this.parser.getSource(source);
        this.play(source);
      } 
    }
    this.updateBackend();
  }

  onChange() {
    console.log("onChange called")
    // two possibilities: upload/push to songQ or skip/next
    // if number of songs hasn't changed, go next
    // otherwise, do nothing
    let updatedSize: number =
      this.data.syncInfo.history.length + this.data.syncInfo.songQ.length;

    // if total size hasn't changed, we know we just need to go to next song
    let isUpload = this.totalSize != updatedSize;

    // qSize used for first upload edge case
    if (this.qSize == 0 || !isUpload) {
      try {
        this.stopPlayback();
        this.host = this.parser.getSource(this.data.syncInfo.songQ[0]);
        this.play(this.host);
      } catch (e) {
        if (this.data.syncInfo.songQ.length > 0) {
          this.data.syncInfo.songQ.shift();
        }
      }
    }
    this.qSize = this.data.syncInfo.songQ.length;
    this.totalSize = updatedSize;
  }

  play(source: string) {
    console.log("play called")
    switch (source) {
      case 'FILE':
        this.playFile();
        break;
      case 'YOUTUBE':
        this.playYT();
        break;
      case 'SOUNDCLOUD':
        //TODO: implement
        break;
      default:
    }
  }

  playFile() {
    this.filePlayer.src = this.data.syncInfo.songQ[0];
    this.filePlayer.currentTime = this.data.syncInfo.time;
    this.filePlayer.play();
  }

  playYT() {
    console.log("playyt called")
    this.youtubeID = this.parser.getYoutubeID(this.data.syncInfo.songQ[0]);
    this.youtubeID
      ? this.ytPlayer.playVideo()
      : this.skipInvalidYT(this.youtubeID);
  }

  stopPlayback() {
    this.filePlayer.src = null;
    this.filePlayer.currentTime = 0;

    this.ytPlayer.stopVideo();
    this.ytPlayer.videoId = null;
    this.data.syncInfo.time = 0;
  }

  skipInvalidYT(event) {
    // TODO: replace with actual output
    console.log(`Error playing Youtube video (${this.youtubeID}). Skipping...`);
    this.data.syncInfo.songQ.shift();
    this.data.syncInfo.time = 0;
    this.next();
  }

  updateBackend() {
    switch (this.host) {
      case 'FILE':
        this.data.syncInfo.time = this.filePlayer.currentTime;
        break;
      case 'YOUTUBE':
        this.data.syncInfo.time = this.ytPlayer.getCurrentTime();
    }
    this.wsService.sendMusicInfo(this.data.syncInfo);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.filePlayer.muted = !this.filePlayer.muted;
    this.ytPlayer.isMuted() ? this.ytPlayer.unMute() : this.ytPlayer.mute();
  }

  timeUpdater() {
    let time = new Date(0);
    switch (this.host) {
      case 'FILE':
        if (this.filePlayer.src) {
          time.setMilliseconds(this.filePlayer.currentTime * 1000);
        }
        break;
      case 'YOUTUBE':
        time.setMilliseconds(this.ytPlayer.getCurrentTime() * 1000);
        break;
    }
    this.timeString = time.toISOString().substr(14, 7);
  }

  ytReady(event) {
    event.target.playVideo();
  }

}
