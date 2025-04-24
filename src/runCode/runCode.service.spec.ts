import { Test, TestingModule } from '@nestjs/testing';
import { RunCodeService } from './runCode.service';

describe('RunCodeService', () => {
	let service: RunCodeService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [RunCodeService],
		}).compile();

		service = module.get<RunCodeService>(RunCodeService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
