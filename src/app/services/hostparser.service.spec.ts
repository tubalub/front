import { TestBed } from '@angular/core/testing';

import { HostparserService } from './hostparser.service';

describe('HostparserService', () => {
  let service: HostparserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HostparserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
