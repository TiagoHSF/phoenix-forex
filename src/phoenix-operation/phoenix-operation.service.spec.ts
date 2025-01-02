import { Test, TestingModule } from '@nestjs/testing';
import { PhoenixOperationService } from './phoenix-operation.service';

describe('PhoenixOperationService', () => {
  let service: PhoenixOperationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhoenixOperationService],
    }).compile();

    service = module.get<PhoenixOperationService>(PhoenixOperationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
