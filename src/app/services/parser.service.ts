import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ParserService {
  constructor() {}

  getSource(url: string): string {
    let domain = new URL(url).hostname;
    console.log(domain);

    if (domain.includes('youtube') || domain.includes('youtu.be')) {
      return 'YOUTUBE';
    }
    if (domain.includes('s3.amazonaws')) {
      return 'FILE';
    }

    return null;
  }

  validURL(url: string): boolean {
    let domain = new URL(url).hostname;
    console.log(domain);
    return domain.includes('youtube') || domain.includes('youtu.be');
  }

  checkProtocol(url: string): string {
    return url.startsWith('http://') || url.startsWith('https://')
      ? url
      : 'http://' + url;
  }

  getYoutubeID(url: string): string {
    let ret = null;
    let urlArr = [];
    if (this.getSource(url) == 'YOUTUBE') {
      if (url.includes('youtu.be')) {
        // youtu.be/pattern
        urlArr = url.split("/");
        ret = urlArr[urlArr.length -1];
      } else {
        // youtube.com/watch?v=pattern
        urlArr = url
          .replace(/(>|<)/gi, '')
          .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);

        if (urlArr[2] !== undefined) {
          ret = urlArr[2].split(/[^0-9a-z_\-]/i);
          ret = ret[0];
        }
      }
    }
    return ret;
  }
}
