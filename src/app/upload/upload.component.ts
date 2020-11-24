import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  file = null;
  filename:string;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  async upload() {
    let uploadUrl = await this.getPresignedUrl();
    console.log(uploadUrl);
    console.log(this.file.type);
    console.log(this.file.name)
    // let fileToUpload = new File([this.file], this.filename);
    // console.log(fileToUpload);
    // console.log(fileToUpload.name)
    let resp = await this.http.put(uploadUrl, this.file).toPromise();
    console.log(resp);
  }

  async getPresignedUrl() {
    return this.http.get(`http://${environment.BACKEND_URL}/upload?filename=${this.filename}`, {'responseType':'text'}).toPromise();
  }

  onFileSelected(event) {
    console.log(event.target.files[0].name);
    this.filename = `${Date.now()}_${event.target.files[0].name}`;
    this.file = event.target.files[0];
  }

}
