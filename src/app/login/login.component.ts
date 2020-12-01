import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username:string = null;

  constructor(private router:Router, private userService:UserService, private wsService: WebsocketService) { }

  ngOnInit(): void {
  }

  async login() {
    if (this.username) {
      sessionStorage.setItem('user',this.username);
      let userlist = this.userService.getUserList();
      if(!(await userlist).includes(this.username)) {
        let ws = this.wsService.initConnection(this.username);
        this.navigateWhenReady(ws);
      } else {
        alert("Username taken")
      }
    } else {
      alert("Enter a username, dumbass")
    }
  }

  navigateWhenReady(ws: WebSocket) {
    console.log("Checking websocket...");
    if (ws.readyState == 1) {
      console.log("Websocket ready");
      this.router.navigate(['home']);
    } else {
      setTimeout(() => {this.navigateWhenReady(ws)}, 10);
    }
  }

}
