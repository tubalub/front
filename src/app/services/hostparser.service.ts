import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HostparserService {

  constructor() { }

  getSource(url:string): string {
    let domain = (new URL(url)).hostname;
    
    if (domain.includes("youtube")) {
      return "YOUTUBE";
    }
    if (domain.includes("s3.amazonaws")) {
      return "FILE";
    }

    return null;
  }

}
