export class MusicSyncInfo {

    time: number;
    playing:boolean = false;
    songQ:string[] = [];
    history:string[] = [];

    constructor(time:number, playing: boolean, songQ:string[], history:string[]) {
        this.playing = playing;
        this.time = time;
        this.songQ = songQ;
        this.history = history;
    }

}
