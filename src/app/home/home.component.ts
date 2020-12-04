import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private userService: UserService, private router:Router) { }

  async ngOnInit() {
    if (!(await this.userService.validateUser())) {
      alert("Session disconnected. Sign back in");
      this.router.navigate(['login']);
    }
  }

}
