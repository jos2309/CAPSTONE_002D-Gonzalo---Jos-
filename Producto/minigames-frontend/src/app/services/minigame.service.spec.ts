import { TestBed } from '@angular/core/testing';

import { MinigameService } from './minigame.service';

describe('MinigameService', () => {
  let service: MinigameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MinigameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
