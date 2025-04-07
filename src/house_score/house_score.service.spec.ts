import { Test, TestingModule } from '@nestjs/testing';
import { HouseScoreService } from './house_score.service';

describe('HouseScoreService', () => {
  let service: HouseScoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HouseScoreService],
    }).compile();

    service = module.get<HouseScoreService>(HouseScoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
