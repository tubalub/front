import { Component, HostListener, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler(event) {
    let user = sessionStorage.getItem('user');
    // need to make synchronous http request here directly using xhr
    // httpclient doesn't seem to work
    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", `http://${environment.BACKEND_URL}/user/${user}`);
    xhr.send();
  }

}
