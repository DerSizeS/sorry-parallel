import { Test, TestingModule } from '@nestjs/testing';
import { DirectorDBInMemoryService } from './director-db-in-memory.service';

describe('DirectorDBInMemoryService', () => {
  let service: DirectorDBInMemoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DirectorDBInMemoryService],
    }).compile();

    service = module.get<DirectorDBInMemoryService>(DirectorDBInMemoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
