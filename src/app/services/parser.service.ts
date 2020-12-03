import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ParserService {
  constructor() {}

  getSource(url: string): string {
    let domain = new URL(url).hostname;

    if (domain.includes('youtube')) {
      return 'YOUTUBE';
    }
    if (domain.includes('s3.amazonaws')) {
      return 'FILE';
    }

    return null;
  }

  getYoutubeID(url: string): string {
    let ret = null;
    if (this.getSource(url) == 'YOUTUBE') {
      let urlArr = url
        .replace(/(>|<)/gi, '')
        .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);

      if (urlArr[2] !== undefined) {
        ret = urlArr[2].split(/[^0-9a-z_\-]/i);
        ret = ret[0];
      }
    }
    return ret;
  }
}
