import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DataService } from './data.service';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private data: DataService, private http: HttpClient) {}

  async validateUser():Promise<boolean> {
    let user = sessionStorage.getItem('user');
    return (user && (await this.getUserList()).includes(user));
  }

  async getUserList(): Promise<string[]> {
    this.data.userList = await this.http
      .get<string[]>(`http://${environment.BACKEND_URL}/users`)
      .toPromise();
    return this.data.userList;
  }
}
