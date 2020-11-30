import { Component, HostListener, OnInit } from '@angular/core';
import { MusicSyncInfo } from '../../models/music-sync-info';
import { WebsocketService } from '../../services/websocket.service'
import { HostparserService } from '../../services/hostparser.service'
import { DataService } from '../../services/data.service'
import { UserService } from '../../services/user.service'
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-musicplayer',
  templateUrl: './musicplayer.component.html',
  styleUrls: ['./musicplayer.component.css'],
})
export class MusicplayerComponent implements OnInit {
  nowPlaying = new Audio();
  timeString = "00:00.0";

  constructor(private wsService: WebsocketService, 
    private parser: HostparserService, 
    public data: DataService, 
    private http: HttpClient,
    private userService: UserService,
    private router: Router) {}

  async ngOnInit() {
    if (!(await this.userService.validateUser())) {
      alert("Invalid user");
      this.router.navigate(['login']);
    }
    this.initSync();
    this.nowPlaying.addEventListener("ended", () => {
      this.nowPlaying.currentTime = 0;
      this.next();
    });
    this.wsService.syncInfo.subscribe((sync) => {
      this.onChange(sync);
    });
    setInterval(() => {this.timeUpdater(this.nowPlaying)}, 100);
  }

  async initSync() {
    this.data.syncInfo = await this.http.get<MusicSyncInfo>(`http://${environment.BACKEND_URL}/sync`).toPromise();
    let currentSong = this.data.syncInfo.songQ[0];
    if (currentSong) {
      this.nowPlaying.src = currentSong;
      this.nowPlaying.currentTime = this.data.syncInfo.time;
      this.nowPlaying.play();
    }
  }

  skip() {
    this.next();
  }

  next(): void {
    let source = this.data.syncInfo.songQ[0];
    if (source) {
      this.data.syncInfo.history.push(this.data.syncInfo.songQ.shift());
      this.nowPlaying.src = source
      this.nowPlaying.play()
      this.updateBackend();
    }
  }

  onChange(sync: MusicSyncInfo) {
    this.data.syncInfo = sync;
    // edge case when last song finishes playing
    if (this.data.syncInfo.songQ.length == 0) {
      this.nowPlaying.src = undefined;
      this.nowPlaying.currentTime = 0;
    // otherwise, if we need to switch songs
    } else if (decodeURIComponent(this.nowPlaying.src) != this.data.syncInfo.songQ[0]) {
      this.nowPlaying.src = sync.songQ[0];
      this.nowPlaying.currentTime = sync.time;
      this.nowPlaying.play();
    }
  }

  updateBackend() {
    this.data.syncInfo.time = this.nowPlaying.currentTime;
    this.wsService.send(this.data.syncInfo);
  }

  toggleMute() {
    this.nowPlaying.muted = !this.nowPlaying.muted;
  }

  timeUpdater(audio) {
    if (audio.src) {
      let time = new Date(0);
      time.setMilliseconds(this.nowPlaying.currentTime*1000);
      this.timeString = time.toISOString().substr(14,7);
    }
  }

  @HostListener('window:unload', [ '$event' ])
  beforeUnloadHandler(event) {
    let user = sessionStorage.getItem('user');
    // need to make synchronous http request here directly using xhr
    // httpclient doesn't seem to work
    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", `http://${environment.BACKEND_URL}/user/${user}`);
    xhr.send();
    alert("Closing");
  }

}
