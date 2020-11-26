import { Injectable } from '@angular/core';
import { MusicSyncInfo } from '../models/music-sync-info';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public syncInfo = new MusicSyncInfo(0, [], []);

  // actual value doesn't matter
  // changes to this value are used to tell musicplayer to update syncInfo
  public syncFlag = false;

  constructor() { }
}
