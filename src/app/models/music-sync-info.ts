export class MusicSyncInfo {

    time: number;
    songQ:string[] = [];
    history:string[] = [];

    constructor(time:number, songQ:string[], history:string[]) {
        this.time = time;
        this.songQ = songQ;
        this.history = history;
    }

}
