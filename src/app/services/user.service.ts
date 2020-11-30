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

  async addUser(username: string): Promise<boolean> {
    sessionStorage.setItem('user', username);
    try {
      let userList: string[] = await this.http
        .put<string[]>(`http://${environment.BACKEND_URL}/user`, username)
        .toPromise();
      this.data.userList = userList;
      return true;
    } catch (error) {
      return false;
    }
  }

  async validateUser(): Promise<boolean> {
    let user = sessionStorage.getItem('user');
    await this.getUserList();
    if (user && this.data.userList.includes(user)) {
      return true;
    }
    return false;
  }

  async getUserList(): Promise<string[]> {
    this.data.userList = await this.http
      .get<string[]>(`http://${environment.BACKEND_URL}/users`)
      .toPromise();
    return this.data.userList;
  }
}
