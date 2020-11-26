import { Injectable } from '@angular/core';
import { MusicSyncInfo } from '../models/music-sync-info';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public syncInfo = new MusicSyncInfo(0, [], []);
  public userList:string[] = [];

  constructor() { }
}
