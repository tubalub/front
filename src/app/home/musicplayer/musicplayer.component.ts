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
  nowPlaying = new Audio();
  timeString = '00:00.0';
  host = null;

  // youtube related
  @ViewChild('ytElement') ytPlayer: YouTubePlayer;
  ytPlayerVars = { autoplay: 1, controls: 0 };
  apiLoaded = false;
  youtubeID = null;

  constructor(
    private wsService: WebsocketService,
    private parser: ParserService,
    public data: DataService,
    private http: HttpClient
  ) {}

  ngOnInit() {}

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
    this.nowPlaying.addEventListener('ended', () => {
      this.nowPlaying.currentTime = 0;
      this.next();
    });

    // Subscribe to changes in sync info from data service class
    // Allows changes to propagate via onChange
    this.data.musicSubj.subscribe(() => {
      this.onChange();
    });

    // Function to display current timestamp
    setInterval(() => {
      this.timeUpdater(this.nowPlaying);
    }, 100);

    console.log(this.ytPlayer);
  }

  // gets sync info from backend and starts playing
  async initSync() {
    this.data.syncInfo = await this.http
      .get<MusicSyncInfo>(`http://${environment.BACKEND_URL}/sync`)
      .toPromise();
    let currentSong = this.data.syncInfo.songQ[0];
    if (currentSong) {
      this.host = this.parser.getSource(currentSong);
      this.play(this.host);
    }
  }

  // Keep this for future features that require different logic for manual skips
  // e.x vote skip, displaying user actions (i.e. "Bob skipped song x")
  skip() {
    this.next();
  }

  // Plays next song in songQ
  next(): void {
    if (this.host != 'FILE') {
      // stop current embedded player
      this.youtubeID = null;
    }

    let source = this.data.syncInfo.songQ[0];
    if (source) {
      this.host = this.parser.getSource(source);
      console.log("next():");
      console.log(this.host);
      this.data.syncInfo.history.push(this.data.syncInfo.songQ.shift());
      this.play(source);
      this.updateBackend();
    }
  }

  // Function to be called when sync info is updated from backend
  onChange() {
    console.log('onChange');
    // edge case when last song finishes playing
    if (this.data.syncInfo.songQ.length == 0) {
      // stop Audio
      this.nowPlaying.src = undefined;
      this.nowPlaying.currentTime = 0;
      // stop YT
      this.ytPlayer.videoId = null;
      // otherwise, if we need to switch songs
    } else if (
      decodeURIComponent(this.nowPlaying.src) != this.data.syncInfo.songQ[0]
    ) {
      try {
        this.host = this.parser.getSource(this.data.syncInfo.songQ[0]);
        this.play(this.host);
      } catch (e) {
        console.log(e);
        this.data.syncInfo.songQ.shift();
        console.log(this.data.syncInfo.songQ);
        this.updateBackend;
      }
    }
  }

  play(source: string) {
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
    this.nowPlaying.src = this.data.syncInfo.songQ[0];
    this.nowPlaying.currentTime = this.data.syncInfo.time;
    this.nowPlaying.play();
  }

  playYT() {
    console.log('playYT called for:');
    this.youtubeID = this.parser.getYoutubeID(this.data.syncInfo.songQ[0]);
    console.log(this.youtubeID);
    this.youtubeID
      ? this.ytPlayer.playVideo()
      : this.skipInvalidYT(this.youtubeID);
  }

  skipInvalidYT(event) {
    console.log(event);
    // TODO: replace with actual output
    console.log(`Error playing Youtube video (${this.youtubeID}). Skipping...`);
    this.data.syncInfo.songQ.shift();
    this.data.syncInfo.time = 0;
    this.next();
  }

  updateBackend() {
    this.data.syncInfo.time = this.nowPlaying.currentTime;
    console.log('Updating backend with:');
    console.log(this.data.syncInfo);
    this.wsService.sendMusicInfo(this.data.syncInfo);
  }

  toggleMute() {
    this.nowPlaying.muted = !this.nowPlaying.muted;
    this.ytPlayer.isMuted() ? this.ytPlayer.unMute() : this.ytPlayer.mute();
  }

  timeUpdater(audio: HTMLAudioElement) {
    let time = new Date(0);
    switch (this.host) {
      case 'FILE':
        if (audio.src) {
          time.setMilliseconds(this.nowPlaying.currentTime * 1000);
        }
        break;
      case 'YOUTUBE':
        time.setMilliseconds(this.ytPlayer.getCurrentTime()*1000);
        break;
    }
    this.timeString = time.toISOString().substr(14, 7);

  }

  ytReady(event) {
    event.target.playVideo();
  }
}
