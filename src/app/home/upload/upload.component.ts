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
  uploadURL:string = null;

  constructor(private http: HttpClient, public data: DataService, private wsService: WebsocketService) { }

  ngOnInit(): void {
  }

  // Gets a presigned URL for the S3 bucket from the backend
  // Then sends a PUT request to that presigned URL with the file
  async upload() {
    let uploadUrl = await this.getPresignedUrl();
    this.http.put(uploadUrl, this.file, {observe: 'response'}).subscribe(resp => {
      // TODO: don't add to list when we upload an invalid file
      // apparently AWS sends 200 even when no file is uploaded
      if(Math.floor(resp.status / 100) == 2) {
        this.data.syncInfo.songQ.push(`${environment.S3_BASE_URL}/uploads/${this.filename}`);
        this.wsService.sendMusicInfo(this.data.syncInfo);
      } else {
        alert("Problem during file upload");
      }
    })
  }

  // Updates songQ with URL directly
  // TODO: validate URLs
  async urlUpload() {
    this.data.syncInfo.songQ.push(this.uploadURL);
    this.wsService.sendMusicInfo(this.data.syncInfo);
  }

  async getPresignedUrl() {
    return this.http.get(`http://${environment.BACKEND_URL}/upload?filename=${this.filename}`, {'responseType':'text'}).toPromise();
  }

  onFileSelected(event: { target: { files: any[]; }; }) {
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
    // see: https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingMetadata.html
    ret = ret.replace(/\{|\}|\^|\%|\`|\[|\]|\"|<|>|\~|\#|\||\@|\&/g,'');
    return ret;
  }

}
