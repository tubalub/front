import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DataService } from '../../services/data.service';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  file = null;
  filename:string;

  constructor(private http: HttpClient, public data: DataService, private wsService: WebsocketService) { }

  ngOnInit(): void {
  }

  async upload() {
    let uploadUrl = await this.getPresignedUrl();
    this.http.put(uploadUrl, this.file, {observe: 'response'}).subscribe(resp => {
      if(Math.floor(resp.status / 100) == 2) {
        this.data.syncInfo.songQ.push(`${environment.S3_BASE_URL}/uploads/${this.filename}`);
        this.wsService.sendMusicInfo(this.data.syncInfo);
      } else {
        alert("Problem during file upload");
      }
    })

  }

  async getPresignedUrl() {
    return this.http.get(`http://${environment.BACKEND_URL}/upload?filename=${this.filename}`, {'responseType':'text'}).toPromise();
  }

  onFileSelected(event) {
    this.filename = `${Date.now()}_${event.target.files[0].name}`;
    this.filename = this.sanitizeFilename(this.filename);
    this.file = event.target.files[0];
    console.log("this.filename: " + this.filename);
  }

  sanitizeFilename(input:string): string {
    let ret = input;
    // replace spaces with underscores
    ret = ret.replace(/\s/g,'_');

    // remove characters for S3
    ret = ret.replace(/\{|\}|\^|\%|\`|\[|\]|\"|<|>|\~|\#|\||\@|\&/g,'');
    console.log("ret: " + ret);
    return ret;
  }

}
