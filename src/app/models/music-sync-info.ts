export class MusicSyncInfo {

    link:string;
    index: number;
    time: number;
    playing:boolean = false;
    songQ:string[] = [];
    history:string[] = [];

    constructor(link:string, index:number, playing: boolean, songQ:string[], history:string[]) {
        this.link = link;
        this.index = index;
        this.playing = playing;
        this.time = Date.now();
        this.songQ = songQ;
        this.history = history;
    }

}
