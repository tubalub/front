import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  file = null;
  filename:string;

  constructor(private http: HttpClient, public data: DataService) { }

  ngOnInit(): void {
  }

  async upload() {
    let uploadUrl = await this.getPresignedUrl();
    let resp = await this.http.put(uploadUrl, this.file).toPromise();
    this.data.songQ.push(`${environment.S3_BASE_URL}/${this.filename}`);
  }

  async getPresignedUrl() {
    return this.http.get(`http://${environment.BACKEND_URL}/upload?filename=${this.filename}`, {'responseType':'text'}).toPromise();
  }

  onFileSelected(event) {
    this.filename = `${Date.now()}_${event.target.files[0].name}`;
    this.file = event.target.files[0];
  }

}