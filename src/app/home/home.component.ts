import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private userService: UserService, private router:Router) { }

  async ngOnInit() {
    if (!(this.userService.validateUser())) {
      alert("Invalid user");
      this.router.navigate(['login']);
    }
  }

}
