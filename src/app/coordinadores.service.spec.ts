import { TestBed, inject } from '@angular/core/testing';

import { CoordinadoresService } from './coordinadores.service';

describe('CoordinadoresService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoordinadoresService]
    });
  });

  it('should be created', inject([CoordinadoresService], (service: CoordinadoresService) => {
    expect(service).toBeTruthy();
  }));
});
