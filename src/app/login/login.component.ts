import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username:string = null;

  constructor(private router:Router, private userService:UserService) { }

  ngOnInit(): void {
  }

  async login() {
    if (this.username) {
      if(await this.userService.addUser(this.username)) {
        this.router.navigate(['home']);
      } else {
        alert("Username taken")
      }
    } else {
      alert("Enter a username, dumbass")
    }
  }

}
