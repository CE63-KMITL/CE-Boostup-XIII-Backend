import { Test, TestingModule } from '@nestjs/testing';
import { HouseScoreController } from './house_score.controller';

describe('HouseScoreController', () => {
  let controller: HouseScoreController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HouseScoreController],
    }).compile();

    controller = module.get<HouseScoreController>(HouseScoreController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
