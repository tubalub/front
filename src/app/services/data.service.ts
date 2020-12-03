import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MusicSyncInfo } from '../models/music-sync-info';

@Injectable({
  providedIn: 'root'
})
// Service class for passing data between components
export class DataService {

  public syncInfo = new MusicSyncInfo(0, [], []);
  public userList:string[] = [];

  public musicSubj = new Subject<MusicSyncInfo>();
  public userSubj = new Subject<string[]>();

  constructor() {
    this.musicSubj.subscribe((syncInfo) => {
      this.syncInfo = syncInfo;
    });
    this.userSubj.subscribe((userList) => {
      this.userList = userList.sort();
    })
  }
}
