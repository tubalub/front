import { MusicSyncInfo } from './music-sync-info';

describe('MusicSyncInfo', () => {
  it('should create an instance', () => {
    expect(new MusicSyncInfo(9,[],[])).toBeTruthy();
  });
});
